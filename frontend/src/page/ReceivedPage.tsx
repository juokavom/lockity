import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, Typography } from '@mui/material';
import { Dispatch, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Modal, ModalBody, ModalHeader
} from 'reactstrap';
import CustomPagination from '../component/PaginationComponent';
import { RequestBuilder } from '../model/RequestBuilder';
import { ENDPOINTS, SUPPORTED_FILE_TYPES } from '../model/Server';
import { Action } from '../redux/actionCreators/Action';
import { ReceivedActionCreators } from '../redux/actionCreators/ReceivedActionCreators';
import { useTypedSelector } from '../redux/Store';
import { formatBytes } from './FilesPage';


interface IReceivedFileProps {
    receivedMetadata: IReceivedMetadata,
    action: (action: string) => void
}

export interface IReceivedMetadata {
    id: string,
    title: string,
    size: number,
    ownerEmail: string
}

interface IReceivedModalProps {
    receivedMetadata: IReceivedMetadata,
    callback: (success: boolean) => void
}

const FileAction = {
    Preview: "Preview file"
}

function File({ receivedMetadata, action }: IReceivedFileProps) {
    const format = receivedMetadata.title.split('.').pop();
    const windowState = useTypedSelector((state) => state.windowReducer)

    const buttons = (
        <>
            <div className="col-4 col-lg-2 d-flex justify-content-center">
                {formatBytes(receivedMetadata.size)}
            </div>
            <div className="col-auto">
                {format && SUPPORTED_FILE_TYPES.includes(format) ?
                    <IconButton onClick={() => action(FileAction.Preview)}>
                        <VisibilityOutlinedIcon />
                    </IconButton> :
                    <IconButton disabled  >
                        <VisibilityOffOutlinedIcon />
                    </IconButton>
                }
            </div>
            <div className="col-auto">
                <IconButton href={ENDPOINTS.FILE.downloadReceivedWithFileId(receivedMetadata.id)}>
                    <GetAppOutlinedIcon />
                </IconButton>
            </div>
        </>
    );


    return (
        <div className="file container" >
            <div className="row align-items-center d-flex justify-content-center">
                <div className="col col-lg-4 ellipse-text d-flex justify-content-center">
                    <p className="ellipse-text" style={{ maxWidth: "350px" }}>{receivedMetadata.title}</p>
                </div>
                <div className="col col-lg-4 ellipse-text d-flex justify-content-center">
                    <p className="ellipse-text" style={{ maxWidth: "150px" }}>{receivedMetadata.ownerEmail}</p>
                </div>
                {!windowState.smallView && buttons}
            </div>
            {windowState.smallView &&
                <div className="row align-items-center d-flex justify-content-center">
                    {buttons}
                </div>
            }
        </div>
    );
}

const fileNameJsx = (title: string) => (
    <Typography sx={{ mb: 2 }} className="ellipse-text" align="center" component="h1" variant="h5">
        {title}
    </Typography>
);

function Preview({ receivedMetadata, callback }: IReceivedModalProps): JSX.Element {
    const [format] = useState(receivedMetadata.title.split('.').pop());

    const src = ENDPOINTS.FILE.streamReceivedWithFileId(receivedMetadata.id)

    const videoJsx = () => (
        <video style={{ maxWidth: "100%" }} controls controlsList="nodownload nofullscreen">
            <source src={src} type="video/mp4" />
        </video>
    );

    const audioJsx = () => (
        <audio style={{ maxWidth: "100%" }} controls controlsList="nodownload nofullscreen">
            <source src={src} type="audio/mpeg" />
        </audio>
    );

    const pictureJsx = () => (
        <img style={{ maxWidth: "100%" }} src={src} />
    );

    let selected = null

    if (format) {
        if (format == "mp4") {
            selected = videoJsx()
        } else if (format == "mp3") {
            selected = audioJsx()
        } else if (["png", "jpg", "jpeg"].includes(format)) {
            selected = pictureJsx()
        }
    }

    if (selected != null) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {fileNameJsx(receivedMetadata.title)}
                    </div>
                </div>
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {selected}
                    </div>
                </div>
            </div>
        );
    } else {
        return (<div></div>);
    }
}

const fetchReceivedMetadata = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) =>
    await new RequestBuilder()
        .withUrl(ENDPOINTS.FILE.getReceivedMetadataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(ReceivedActionCreators.setReceivedSelected(selected))
            if (response) {
                const receivedMetadata: IReceivedMetadata[] = response
                dispatch(ReceivedActionCreators.setReceivedMetadata(receivedMetadata))
            } else {
                dispatch(ReceivedActionCreators.setReceivedMetadata(null))
            }
        }, () => dispatch(ReceivedActionCreators.setReceivedMetadata(null)))


const fetchReceivedMetadataCount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.FILE.getReceivedMetadataCount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const receivedCount: { receivedCount: number } = response
                dispatch(ReceivedActionCreators.setReceivedMetadataCount(receivedCount.receivedCount))
            } else {
                dispatch(ReceivedActionCreators.setReceivedMetadataCount(null))
            }
        }, () => dispatch(ReceivedActionCreators.setReceivedMetadataCount(null)))
}

export const RECEIVED_CHUNK_SIZE = 5

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
        if (!receivedState.receivedMetadataCount || !receivedState.receivedMetadatas) {
            fetchData()
        }
    }, [])

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.receivedMetadata) {
                const modalProps: IReceivedModalProps = {
                    receivedMetadata: modalData.receivedMetadata,
                    callback: () => setModalOpen(false)
                }
                switch (modalData.action) {
                    case FileAction.Preview:
                        return (<Preview {...modalProps} />);
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
                    modalData?.action == FileAction.Preview ? "lg" : ""
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
                    receivedState.receivedMetadatas && receivedState.receivedMetadatas.length != 0 ?
                    receivedState.receivedMetadatas.map((receivedMeta: IReceivedMetadata) => {
                            return (
                                <File key={receivedMeta.id} {...props(receivedMeta)}></File>
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
                        fetchItems:  (offset: number, limit: number, selected: number) => dispatch(fetchReceivedMetadata(offset, limit, selected))
                    }} /> : <div></div>
                }
            </div>
        </div>
    );
}