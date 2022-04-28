import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { SHARED_CHUNK_SIZE } from '../../model/Constants';
import { useTypedSelector } from '../../redux/Store';
import CustomPagination from '../main/components/PaginationComponent';
import { CreateShared } from './components/CreateSharedComponent';
import { DeleteShared } from './components/DeleteSharedComponent';
import { EditShared } from './components/EditSharedComponent';
import { ISharedMetadata, IShareModalProps, ShareAction } from './model/SharedModels';
import { fetchSharedMetadata, fetchSharedMetadataCount } from './request/SharedRequests';

export function SharedPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        shareMetadata: ISharedMetadata | null
    } | null>(null)
    
    const dispatch = useDispatch()
    const sharedState = useTypedSelector((state) => state.sharedReducer)

    const fetchData = () => {
        dispatch(fetchSharedMetadataCount())
        dispatch(fetchSharedMetadata(0, SHARED_CHUNK_SIZE, 1))
    }

    useEffect(() => {
        if (!sharedState.fetched) {
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
            if (modalData.action === ShareAction.Create) return (<CreateShared {...{ callback: modalCallback }} />);
            else if (modalData.shareMetadata) {
                const modalProps: IShareModalProps = {
                    shareMetadata: modalData.shareMetadata,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case ShareAction.Edit:
                        return (<EditShared {...modalProps} />);
                    case ShareAction.Delete:
                        return (<DeleteShared {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const SharedFileRow = (shareMeta: ISharedMetadata) => (
        <tr>
            <td>{shareMeta.file.title}</td>
            <td>{shareMeta.user.publicName}</td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: ShareAction.Edit,
                            shareMetadata: shareMeta
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Edit
                </Button>
            </td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: ShareAction.Delete,
                            shareMetadata: shareMeta
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Delete
                </Button>
            </td>
        </tr>
    );

    const SharedRows = () => {
        if (sharedState.sharedMetadatas) {
            return sharedState.sharedMetadatas?.map((shareMeta: ISharedMetadata) => {
                return (
                    <SharedFileRow key={shareMeta.id} {...shareMeta} />
                );
            })
        }
        return null
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center" style={{ marginBottom: "1rem" }}>
                <Box className="col-8 col-md-6 col-lg-4" component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ color: "#ebf0f", width: "100%" }}
                        onClick={() => {
                            setModalData({
                                action: ShareAction.Create,
                                shareMetadata: null
                            })
                            selectActionJsx()
                            toggleModal()
                        }}>
                        Share File
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
                sharedState.sharedMetadatas && sharedState.sharedMetadatas.length !== 0 ?
                    <div className="row align-items-center d-flex justify-content-center">
                        <table className="table table-hover table-ellipsis">
                            <thead>
                                <tr>
                                    <th scope="col">File</th>
                                    <th scope="col">User</th>
                                    <th style={{ width: "10%" }}></th>
                                    <th style={{ width: "10%" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {SharedRows()}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="container">
                        <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                            <div className="col-auto">
                                <h5><i>You don't have any shared files</i></h5>
                            </div>
                        </div>
                    </div>
            }
            {
                sharedState.sharedMetadataCount && sharedState.sharedMetadataCount > 0 ? <CustomPagination {...{
                    total: sharedState.sharedMetadataCount,
                    chunkSize: SHARED_CHUNK_SIZE,
                    selected: sharedState.pageSelected,
                    fetchItems: (offset: number, limit: number, selected: number) => dispatch(fetchSharedMetadata(offset, limit, selected))
                }} /> : <div></div>
            }
        </div>
    );
}