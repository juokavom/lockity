import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { RECEIVED_CHUNK_SIZE } from '../../model/Constants';
import { useTypedSelector } from '../../redux/Store';
import { FilePreview } from '../files/component/FilePreviewComponent';
import { IFilePreviewProps } from '../files/model/FileModels';
import CustomPagination from '../main/components/PaginationComponent';
import { ReceivedFile } from './component/ReceivedFileComponent';
import { FileAction, IReceivedFileProps, IReceivedMetadata } from './model/ReceivedModels';
import { fetchReceivedMetadata, fetchReceivedMetadataCount } from './request/ReceivedRequests';

export function ReceivedPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        receivedMetadata: IReceivedMetadata | null
    } | null>(null)

    const dispatch = useDispatch()
    const receivedState = useTypedSelector((state) => state.receivedReducer)

    const fetchData = () => {
        dispatch(fetchReceivedMetadataCount())
        dispatch(fetchReceivedMetadata(0, RECEIVED_CHUNK_SIZE, 1))
    }

    useEffect(() => {
        if (!receivedState.fetched) {
            fetchData()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.receivedMetadata) {
                const previewProps: IFilePreviewProps = {
                    id: modalData.receivedMetadata.id,
                    title: modalData.receivedMetadata.title
                }
                switch (modalData.action) {
                    case FileAction.Preview:
                        return (<FilePreview {...previewProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const props = (receivedMetadata: IReceivedMetadata): IReceivedFileProps => {
        return {
            receivedMetadata: receivedMetadata,
            action: (action: string) => {
                setModalData({
                    action: action,
                    receivedMetadata: receivedMetadata
                })
                toggleModal()
            }
        }
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center">
                <Modal className="container" size={
                    modalData?.action === FileAction.Preview ? "lg" : ""
                } isOpen={modalOpen} toggle={() => { toggleModal() }}>
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
                    receivedState.receivedMetadatas && receivedState.receivedMetadatas.length !== 0 ?
                        receivedState.receivedMetadatas.map((receivedMeta: IReceivedMetadata) => {
                            return (
                                <ReceivedFile key={receivedMeta.id} {...props(receivedMeta)}></ReceivedFile>
                            );
                        })
                        :
                        <div className="container">
                            <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                                <div className="col-auto">
                                    <h5><i>You don't have any received files</i></h5>
                                </div>
                            </div>
                        </div>
                }
                {
                    receivedState.receivedMetadataCount && receivedState.receivedMetadataCount > 0 ? <CustomPagination {...{
                        total: receivedState.receivedMetadataCount,
                        chunkSize: RECEIVED_CHUNK_SIZE,
                        selected: receivedState.pageSelected,
                        fetchItems: (offset: number, limit: number, selected: number) => dispatch(fetchReceivedMetadata(offset, limit, selected))
                    }} /> : <div></div>
                }
            </div>
        </div>
    );
}