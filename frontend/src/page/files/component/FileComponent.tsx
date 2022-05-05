import { IconButton } from "@mui/material";
import { ENDPOINTS, SUPPORTED_EDITING_TYPES, SUPPORTED_PREVIEW_TYPES } from "../../../model/Server";
import { useTypedSelector } from "../../../redux/Store";
import { bytesToFormattedSize, FileAction, fileTitleToFormat, IFileProps } from "../model/FileModels";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';

const formatDateString = (dateString: string) => {
    const splittedDate = dateString.split('T')
    const splittedTime = splittedDate[1].split(':')
    return splittedDate[0] + " " + splittedTime[0] + ":" + splittedTime[1]
}

export const File = ({ fileMetadata, action }: IFileProps) => {
    const format = fileTitleToFormat(fileMetadata.title);
    const windowState = useTypedSelector((state) => state.windowReducer)
    const formattedSize = bytesToFormattedSize(fileMetadata.size)

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

    if (windowState.smallView) {
        return (
            <div className="file container" >
                <div className="row align-items-center d-flex justify-content-center">
                    <div className="col col-lg-4 ellipse-text d-flex justify-content-center">
                        <p className="ellipse-text" style={{ maxWidth: "400px" }}>{fileMetadata.title}</p>
                    </div>
                </div>
                <div className="row align-items-center d-flex justify-content-center">
                    <div className="col-auto">
                        {formattedSize.size + " " + formattedSize.unit}
                    </div>
                    <div className="col-auto">
                        {formatDateString(fileMetadata.uploaded)}
                    </div>
                </div>
                <div className="row align-items-center d-flex justify-content-center">
                    {buttons}
                </div>
            </div>
        );
    } else {
        return (
            <div className="file container" >
                <div className="row align-items-center d-flex justify-content-center">
                    <div className="col col-lg-6 ellipse-text d-flex justify-content-center">
                        <p className="ellipse-text" style={{ maxWidth: "600px" }}>{fileMetadata.title}</p>
                    </div>
                    <div className="col-auto">
                        {formattedSize.size + " " + formattedSize.unit}
                    </div>
                    <div className="col-auto">
                        {formatDateString(fileMetadata.uploaded)}
                    </div>
                </div>
                <div className="row align-items-center d-flex justify-content-center">
                    {buttons}
                </div>
            </div>
        );
    }
}