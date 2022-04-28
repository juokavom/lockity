import {
    Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { API_CHUNK_SIZE } from '../../model/Constants';
import { useTypedSelector } from '../../redux/Store';
import CustomPagination from '../main/components/PaginationComponent';
import { CreateAPI } from './component/CreateAPIComponent';
import { DeleteAPI } from './component/DeleteAPIComponent';
import { ShowAPI } from './component/ShowAPIComponent';
import { APIAction, IAPIData, IAPIModalProps } from './model/APIModel';
import { fetchAPICount, fetchAPIData } from './request/APIRequests';

export function APIPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        apiData: IAPIData | null
    } | null>(null)

    const dispatch = useDispatch()
    const apiState = useTypedSelector((state) => state.apiReducer)

    const fetchData = () => {
        dispatch(fetchAPICount())
        dispatch(fetchAPIData(0, API_CHUNK_SIZE, 1))
    }

    useEffect(() => {
        if (!apiState.fetched) {
            fetchData()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            fetchData()
        }
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.action === APIAction.Create) return (<CreateAPI {...{ callback: modalCallback }} />);
            else if (modalData.apiData) {
                const modalProps: IAPIModalProps = {
                    apiData: modalData.apiData,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case APIAction.Show:
                        return (<ShowAPI {...modalProps} />);
                    case APIAction.Revoke:
                        return (<DeleteAPI {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const APITokenRow = (apiData: IAPIData) => (
        <tr>
            <td>{apiData.title}</td>
            <td>{apiData.token + "***"}</td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="primary"
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: APIAction.Show,
                            apiData: apiData
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Show
                </Button>
            </td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: APIAction.Revoke,
                            apiData: apiData
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Revoke
                </Button>
            </td>
        </tr>
    );

    const APIRows = () => {
        if (apiState.apiDatas) {
            return apiState.apiDatas?.map((apiData: IAPIData) => {
                return (
                    <APITokenRow key={apiData.token} {...apiData} />
                );
            })
        }
        return null
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center" style={{ marginBottom: "1rem" }}>
                <Box className="col-8 col-md-6 col-lg-4 row align-items-center d-flex justify-content-center"
                    component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        className="btn-grad"
                        onClick={() => {
                            setModalData({
                                action: APIAction.Create,
                                apiData: null
                            })
                            selectActionJsx()
                            toggleModal()
                        }}>
                        Create API token
                    </Button>
                </Box>
            </div>
            <Modal className="container" size="" isOpen={modalOpen} toggle={() => { toggleModal() }}>
                <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center">
                        <p>{modalData?.action}</p>
                    </div>
                </ModalHeader>
                <ModalBody className="row align-items-center d-flex justify-content-center m-2">
                    <div className="col">
                        {selectActionJsx()}
                    </div>
                </ModalBody>
            </Modal>
            {
                apiState.apiDatas && apiState.apiDatas.length !== 0 ?
                    <div className="row align-items-center d-flex justify-content-center">
                        <table className="table table-hover table-ellipsis">
                            <thead>
                                <tr>
                                    <th scope="col">Title</th>
                                    <th scope="col">Token</th>
                                    <th style={{ width: "10%" }}></th>
                                    <th style={{ width: "10%" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {APIRows()}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="container">
                        <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                            <div className="col-auto">
                                <h5><i>There are no API tokens</i></h5>
                            </div>
                        </div>
                    </div>
            }
            {
                apiState.apiCount && apiState.apiCount > 0 ? <CustomPagination {...{
                    total: apiState.apiCount,
                    chunkSize: API_CHUNK_SIZE,
                    selected: apiState.pageSelected,
                    fetchItems: (offset: number, limit: number, selected: number) => dispatch(fetchAPIData(offset, limit, selected))
                }} /> : <div></div>
            }
        </div>
    );
}