import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { FILE_CHUNK_SIZE } from '../../model/Constants';
import { ENDPOINTS, SUPPORTED_IMAGE_TYPES } from '../../model/Server';
import { useTypedSelector } from '../../redux/Store';
import CustomPagination from '../main/components/PaginationComponent';
import FileUploader from '../upload/components/FileUploaderComponent';
import { File } from './component/FileComponent';
import { FileDelete } from './component/FileDeleteComponent';
import { FileEdit } from './component/FileEditComponent';
import { FilePreview } from './component/FilePreviewComponent';
import { FileRename } from './component/FileRenameComponent';
import { FileShare } from './component/FileShareComponent';
import { StorageStatusBar } from './component/StorageStatusBarComponent';
import { FileAction, fileTitleToFormat, IFileEditProps, IFileMetadata, IFileModalProps, IFilePreviewProps, IFileProps, ModalSize } from './model/FileModels';
import { fetchFileMetadata, fetchFileMetadataInfo } from './request/FilesRequests';

export function FilesPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        fileMetadata: IFileMetadata | null
    } | null>(null)
    const [modalSize, setModalSize] = useState<ModalSize>({
        width: undefined,
        height: undefined
    })

    const dispatch = useDispatch()
    const fileState = useTypedSelector((state) => state.fileReducer)

    const fetchData = () => {
        dispatch(fetchFileMetadataInfo())
        dispatch(fetchFileMetadata(0, FILE_CHUNK_SIZE, 1))
    }

    useEffect(() => {
        if (!fileState.fetched) {
            fetchData()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            fetchData()
        }
    }

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    function Upload() {
        return (
            <FileUploader {...{
                isAuthed: true,
                onUpload: () => modalCallback(true),
                onError: () => modalCallback(false)
            }} />
        );
    }

    const selectActionTsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.action === FileAction.Upload) return (<Upload />);
            else if (modalData.fileMetadata) {
                const modalProps: IFileModalProps = {
                    fileMetadata: modalData.fileMetadata,
                    callback: modalCallback
                }
                const previewProps: IFilePreviewProps = {
                    id: modalData.fileMetadata.id,
                    title: modalData.fileMetadata.title,
                    src: ENDPOINTS.FILE.streamWithFileId(modalData.fileMetadata.id)
                }
                const fileEditProps: IFileEditProps = {
                    fileId: modalData.fileMetadata.id,
                    fileTitle:  modalData.fileMetadata.title,
                    src: ENDPOINTS.FILE.streamWithFileId(modalData.fileMetadata.id),
                    uploadSrc: ENDPOINTS.FILE.fileId(modalData.fileMetadata.id),
                    callback: modalCallback
                }                
                switch (modalData.action) {
                    case FileAction.Edit:
                        return (<FileEdit {...fileEditProps} />);
                    case FileAction.Rename:
                        return (<FileRename {...modalProps} />);
                    case FileAction.Preview:
                        return (<FilePreview {...previewProps} />);
                    case FileAction.Share:
                        return (<FileShare {...modalProps} />);
                    case FileAction.Delete:
                        return (<FileDelete {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const props = (fileMetadata: IFileMetadata): IFileProps => {
        return {
            fileMetadata: fileMetadata,
            action: (action: string) => {
                setModalData({
                    action: action,
                    fileMetadata: fileMetadata
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
                            .includes(fileTitleToFormat(fileMetadata.title)) ? "xl" : "lg"
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
                <Box className="col-8 col-md-6 col-lg-4" component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    {
                        fileState.fileMetadataInfo?.storageData &&
                        <div>
                            <StorageStatusBar {...fileState.fileMetadataInfo?.storageData} />
                            <br />
                        </div>
                    }
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ color: "#ebf0f", width: "100%" }}
                        onClick={() => {
                            setModalData({
                                action: FileAction.Upload,
                                fileMetadata: null
                            })
                            setModalSize({
                                width: undefined,
                                height: undefined
                            })
                            selectActionTsx()
                            toggleModal()
                        }}>
                        Upload File
                    </Button>
                </Box>
                <Modal className="container" size={modalSize?.width} 
                    isOpen={modalOpen} toggle={() => { toggleModal() }}>
                    <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center">
                            <p>{modalData?.action}</p>
                        </div>
                    </ModalHeader>
                    <ModalBody className="row align-items-center d-flex justify-content-center">
                        <div className="col">
                            {selectActionTsx()}
                        </div>
                    </ModalBody>
                </Modal>
                {
                    fileState.fileMetadatas && fileState.fileMetadatas.length !== 0 ?
                        fileState.fileMetadatas.map((fileMeta: IFileMetadata) => {
                            return (
                                <File key={fileMeta.id} {...props(fileMeta)}></File>
                            );
                        })
                        :
                        <div className="container">
                            <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                                <div className="col-auto">
                                    <h5><i>You don't have any uploaded files</i></h5>
                                </div>
                            </div>
                        </div>
                }
                {
                    fileState.fileMetadataInfo && fileState.fileMetadataInfo.fileCount > 0 ? <CustomPagination {...{
                        total: fileState.fileMetadataInfo.fileCount,
                        chunkSize: FILE_CHUNK_SIZE,
                        selected: fileState.pageSelected,
                        fetchItems: (offset: number, limit: number, selected: number) => dispatch(fetchFileMetadata(offset, limit, selected))
                    }} /> : <div></div>
                }
            </div>
        </div>
    );
}