import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { RECEIVED_CHUNK_SIZE } from '../../model/Constants';
import { ENDPOINTS, SUPPORTED_IMAGE_TYPES } from '../../model/Server';
import { useTypedSelector } from '../../redux/Store';
import { FileEdit } from '../files/component/FileEditComponent';
import { FilePreview } from '../files/component/FilePreviewComponent';
import { fileTitleToFormat, IFileEditProps, IFilePreviewProps, ModalSize } from '../files/model/FileModels';
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
    const [modalSize, setModalSize] = useState<ModalSize>({
        width: undefined,
        height: undefined
    })

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

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            fetchData()
        }
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.receivedMetadata) {
                const previewProps: IFilePreviewProps = {
                    id: modalData.receivedMetadata.id,
                    title: modalData.receivedMetadata.title,
                    src: ENDPOINTS.FILE.streamReceivedWithFileId(modalData.receivedMetadata.id)
                }
                const fileEditProps: IFileEditProps = {
                    fileId: modalData.receivedMetadata.id,
                    fileTitle: modalData.receivedMetadata.title,
                    src: ENDPOINTS.FILE.streamReceivedWithFileId(modalData.receivedMetadata.id),
                    uploadSrc: ENDPOINTS.FILE.fileWithReceivedId(modalData.receivedMetadata.id),
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case FileAction.Preview:
                        return (<FilePreview {...previewProps} />);
                    case FileAction.Edit:
                        return (<FileEdit {...fileEditProps} />);
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
                const modalSize: ModalSize = {
                    width: undefined,
                    height: undefined
                }
                switch (action) {
                    case FileAction.Preview:
                        modalSize.width = "lg"
                        break
                    case FileAction.Edit:
                        modalSize.width = SUPPORTED_IMAGE_TYPES
                            .includes(fileTitleToFormat(receivedMetadata.title)) ? "xl" : "lg"
                        break
                }
                toggleModal()
                setModalSize(modalSize)
            }
        }
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center">
                <Modal className="container" size={modalSize?.width}
                    isOpen={modalOpen} toggle={() => { toggleModal() }}>
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