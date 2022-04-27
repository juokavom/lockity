import { IconButton } from "@mui/material";
import { ENDPOINTS, SUPPORTED_EDITING_TYPES, SUPPORTED_PREVIEW_TYPES } from "../../../model/Server";
import { useTypedSelector } from "../../../redux/Store";
import { FileAction, fileTitleToFormat, formatBytes, IFileProps } from "../model/FileModels";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';

export const File = ({ fileMetadata, action }: IFileProps) => {
    const format = fileTitleToFormat(fileMetadata.title);
    const windowState = useTypedSelector((state) => state.windowReducer)

    const buttons = (
        <>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Rename)}>
                    <EditOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                {
                    format && SUPPORTED_PREVIEW_TYPES.includes(format) ?
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
                    format && SUPPORTED_EDITING_TYPES.includes(format) ?
                        <IconButton onClick={() => action(FileAction.Edit)}>
                            <ContentCutOutlinedIcon />
                        </IconButton> :
                        <IconButton disabled  >
                            <ContentCutOutlinedIcon />
                        </IconButton>
                }
            </div>
            <div className="col-auto">
                <IconButton href={ENDPOINTS.FILE.downloadWithFileId(fileMetadata.id)}>
                    <GetAppOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Share)}>
                    <ShareOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Delete)}>
                    <DeleteOutlineOutlinedIcon />
                </IconButton>
            </div>
        </>
    );

    return (
        <div className="file container" >
            <div className="row align-items-center d-flex justify-content-center">
                <div className="col col-lg-4 ellipse-text d-flex justify-content-center">
                    <p className="ellipse-text" style={{ maxWidth: "400px" }}>{fileMetadata.title}</p>
                </div>
                <div className="col-4 col-lg-2 d-flex justify-content-center">
                    {formatBytes(fileMetadata.size)}
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