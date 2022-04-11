import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton } from '@mui/material';
import { ENDPOINTS, SUPPORTED_FILE_TYPES } from '../../../model/Server';
import { useTypedSelector } from '../../../redux/Store';
import { formatBytes } from '../../files/model/FileModels';
import { FileAction, IReceivedFileProps } from '../model/ReceivedModels';

export function ReceivedFile({ receivedMetadata, action }: IReceivedFileProps) {
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