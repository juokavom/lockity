import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton } from '@mui/material';
import { ENDPOINTS, SUPPORTED_EDITING_TYPES, SUPPORTED_PREVIEW_TYPES } from '../../../model/Server';
import { useTypedSelector } from '../../../redux/Store';
import { bytesToFormattedSize } from '../../files/model/FileModels';
import { FileAction, IReceivedFileProps } from '../model/ReceivedModels';

export function ReceivedFile({ receivedMetadata, action }: IReceivedFileProps) {
    const format = receivedMetadata.title.split('.').pop();
    const windowState = useTypedSelector((state) => state.windowReducer)
    const formattedSize = bytesToFormattedSize(receivedMetadata.size)

    const buttons = (
        <>
            <div className="col-4 col-lg-2 d-flex justify-content-center">
                {formattedSize.size + " " + formattedSize.unit}
            </div>
            <div className="col-auto">
                {format && SUPPORTED_PREVIEW_TYPES.includes(format) ?
                    <IconButton onClick={() => action(FileAction.Preview)}>
                        <VisibilityOutlinedIcon />
                    </IconButton> :
                    <IconButton disabled  >
                        <VisibilityOffOutlinedIcon />
                    </IconButton>
                }
            </div>
            <div className="col-auto">
                {
                    format && SUPPORTED_EDITING_TYPES.includes(format) && receivedMetadata.canEdit ?
                        <IconButton onClick={() => action(FileAction.Edit)}>
                            <ContentCutOutlinedIcon />
                        </IconButton> :
                        <IconButton disabled  >
                            <ContentCutOutlinedIcon />
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
                <div className="col col-lg-3 ellipse-text d-flex justify-content-center">
                    <p className="ellipse-text">{receivedMetadata.title}</p>
                </div>
                <div className="col col-lg-3 ellipse-text d-flex justify-content-center">
                    <p className="ellipse-text">{receivedMetadata.ownerPublicName}</p>
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