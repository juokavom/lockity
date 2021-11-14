import Upload from '../upload/UploadPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from '../login/LoginPage';
import { ROUTES } from '../../model/Routes';
import { useEffect, useState } from 'react';
import { User } from '../../model/User';
import Test from '../TestPage';
import './Main.scss';
import { MyFiles, FILE_CHUNK_SIZE, IFileMetadata, IFileState } from '../FilesPage';
import ReceivedFiles from '../ReceivedFilesPage';
import Header from '../Header/HeaderComponent';
import Newsletter from '../NewsletterPage';
import Users from '../UsersPage';
import SharedFiles from '../SharedFilesPage';
import Footer from '../FooterComponent';
import { RequestBuilder } from '../../model/RequestBuilder';
import { ENDPOINTS } from '../../model/Server';

const localStorageUser = localStorage.getItem(User.storagename)
let parsedUser: User.FrontendUser | null = null

if (localStorageUser) {
    parsedUser = JSON.parse(localStorageUser)
}

function useWindowSize() {
    const [windowSize, setWindowSize] = useState<{
        width: number | null,
        height: number | null
    }>({
        width: null,
        height: null,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
}

export interface IHeaderProps {
    user: User.FrontendUser,
    isAdmin: Boolean,
    changedLayout: Boolean
}

export interface IMyFilesProps {
    changedLayout: Boolean,
    fileMetadata: IFileMetadata[] | null,
    fileCount: number | null,
    selected: number,
    fetchFiles: (offset: number, limit: number, selected: number) => void,
    fetchFileCount: () => void
}

export default function Main() {
    const [user] = useState<User.FrontendUser | null>(parsedUser)

    const [changedLayout, setChangedLayout] = useState(false);

    const isAdmin = user != null ? User.isAdmin(user.role) : false
    const isAuthed = user != null ? User.isAuthed(user.role) : false

    const windowSize = useWindowSize();

    useEffect(() => {
        if (windowSize.width && windowSize.width < 992) {
            if (!changedLayout) setChangedLayout(true)
        }
        else {
            if (changedLayout) setChangedLayout(false)
        }
    }, [windowSize])


    const [fileCount, setFileCount] = useState<number | null>(null)
    const [fileMetadata, setFileMetadata] = useState<IFileMetadata[] | null>(null)
    const [fileSelected, setFileSelected] = useState<number>(1)

    const fetchFiles = async (offset: number, limit: number, selected: number) =>
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getFileMetadataWithOffsetAndLimit(offset, limit))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setFileSelected(selected)
                if (response) {
                    const files: IFileMetadata[] = response
                    setFileMetadata(files)
                } else {
                    setFileMetadata(null)
                }
            }, () => setFileMetadata(null))


    const fetchFileCount = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getFileMetadataCount)
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                if (response) {
                    const fileCount: { fileCount: number } = response
                    setFileCount(fileCount.fileCount)
                } else {
                    setFileCount(null)
                }
            }, () => setFileCount(null))
    }

    useEffect(() => {
        if (isAuthed) {
            fetchFileCount()
            fetchFiles(0, FILE_CHUNK_SIZE, 1)
        }
    }, [])

    const headerProps: IHeaderProps = {
        user: user!,
        isAdmin: isAdmin,
        changedLayout: changedLayout
    }

    const myFilesProps: IMyFilesProps = {
        changedLayout: changedLayout,
        fileMetadata: fileMetadata,
        fileCount: fileCount,
        selected: fileSelected,
        fetchFiles: fetchFiles,
        fetchFileCount: fetchFileCount
    }

    if (!isAuthed) {
        return (
            <div>
                <Switch>
                    <Route exact path={ROUTES.login} component={() => <Login />} />
                    <Route exact path={ROUTES.upload} component={() => <Upload />} />
                    <Route exact path={ROUTES.test} component={() => <Test />} />
                    <Redirect to={ROUTES.upload} />
                </Switch>
            </div>
        );
    } else {
        return (
            <div className="container mainbox-main">
                <div className="row justify-content-center">
                    <div className="mainbox col-10 col-sm-12 col-xl-10">
                        <Header {...headerProps} />
                        <div className="min-height route-holder">
                            <Switch>
                                <Route exact path={ROUTES.test} component={() => <Test />} />

                                <Route exact path={ROUTES.myFiles} component={() => <MyFiles {...myFilesProps} />} />
                                <Route exact path={ROUTES.receivedFiles} component={() => <ReceivedFiles />} />
                                <Route exact path={ROUTES.sharedFiles} component={() => <SharedFiles />} />

                                {isAdmin &&
                                    <Route exact path={ROUTES.sendNewsletter} component={() => <Newsletter />} />
                                }
                                {isAdmin &&
                                    <Route exact path={ROUTES.users} component={() => <Users />} />
                                }

                                <Redirect to={ROUTES.myFiles} />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </div>
            </div >
        );
    }
}

