import Upload from '../upload/UploadPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from '../login/LoginPage';
import { ROUTES } from '../../model/Routes';
import { useEffect, useState } from 'react';
import { User } from '../../model/User';
import Test from '../TestPage';
import './Main.scss';
import { MyFiles, FILE_CHUNK_SIZE, IFileMetadata, IFileMetadataInfo } from '../FilesPage';
import { IReceivedFileMetadata, ReceivedFiles, RECEIVED_CHUNK_SIZE } from '../ReceivedFilesPage';
import Header from '../Header/HeaderComponent';
import Newsletter from '../NewsletterPage';
import { IUserData, Users, USER_CHUNK_SIZE } from '../UsersPage';
import Footer from '../FooterComponent';
import { RequestBuilder } from '../../model/RequestBuilder';
import { ENDPOINTS } from '../../model/Server';
import { IShareMetadata, SharedFiles, SHARE_CHUNK_SIZE } from '../SharedFilesPage';

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
    fileMetadataInfo: IFileMetadataInfo | null,
    selected: number,
    fetchFileMetadata: (offset: number, limit: number, selected: number) => void,
    fetchFileMetadataInfo: () => void
}

export interface IReceivedProps {
    changedLayout: Boolean,
    receivedMetadata: IReceivedFileMetadata[] | null,
    receivedMetadataCount: number | null,
    selected: number,
    fetchReceivedMetadata: (offset: number, limit: number, selected: number) => void,
    fetchReceivedMetadataCount: () => void
}

export interface ISharedProps {
    sharedMetadata: IShareMetadata[] | null,
    sharedCount: number | null,
    selected: number,
    fetchSharedMetadata: (offset: number, limit: number, selected: number) => void,
    fetchSharedMetadataCount: () => void
}

export interface IUserProps {
    userData: IUserData[] | null,
    userCount: number | null,
    selected: number,
    fetchUserData: (offset: number, limit: number, selected: number) => void,
    fetchUserCount: () => void
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


    const [fileMetadataInfo, setFileMetadataInfo] = useState<IFileMetadataInfo | null>(null)
    const [fileMetadata, setFileMetadata] = useState<IFileMetadata[] | null>(null)
    const [fileSelected, setFileSelected] = useState<number>(1)

    const fetchFileMetadata = async (offset: number, limit: number, selected: number) =>
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getFileMetadataWithOffsetAndLimit(offset, limit))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setFileSelected(selected)
                if (response) {
                    const fileMetadata: IFileMetadata[] = response
                    setFileMetadata(fileMetadata)
                } else {
                    setFileMetadata(null)
                }
            }, () => setFileMetadata(null))


    const fetchFileMetadataInfo = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getFileMetadataInfo)
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                if (response) {
                    const fileMetadataInfo: IFileMetadataInfo = response
                    setFileMetadataInfo(fileMetadataInfo)
                } else {
                    setFileMetadataInfo(null)
                }
            }, () => setFileMetadataInfo(null))
    }

    const headerProps: IHeaderProps = {
        user: user!,
        isAdmin: isAdmin,
        changedLayout: changedLayout
    }

    const myFilesProps: IMyFilesProps = {
        changedLayout: changedLayout,
        fileMetadata: fileMetadata,
        fileMetadataInfo: fileMetadataInfo,
        selected: fileSelected,
        fetchFileMetadata: fetchFileMetadata,
        fetchFileMetadataInfo: fetchFileMetadataInfo
    }

    const [sharedCount, setSharedCount] = useState<number | null>(null)
    const [sharedMetadata, setSharedMetadata] = useState<IShareMetadata[] | null>(null)
    const [sharedSelected, setSharedSelected] = useState<number>(1)

    const fetchSharedMetadata = async (offset: number, limit: number, selected: number) =>
        await new RequestBuilder()
            .withUrl(ENDPOINTS.SHARED.getSharedMetadataWithOffsetAndLimit(offset, limit))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setSharedSelected(selected)
                if (response) {
                    const shareMetadata: IShareMetadata[] = response
                    setSharedMetadata(shareMetadata)
                } else {
                    setSharedMetadata(null)
                }
            }, () => setSharedMetadata(null))


    const fetchSharedMetadataCount = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.SHARED.getSharedMetadataCount)
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                if (response) {
                    const sharedAccessCount: { sharedAccessCount: number } = response
                    setSharedCount(sharedAccessCount.sharedAccessCount)
                } else {
                    setSharedCount(null)
                }
            }, () => setSharedCount(null))
    }

    const sharedProps: ISharedProps = {
        sharedMetadata: sharedMetadata,
        sharedCount: sharedCount,
        selected: sharedSelected,
        fetchSharedMetadata: fetchSharedMetadata,
        fetchSharedMetadataCount: fetchSharedMetadataCount
    }

    const [userCount, setUserCount] = useState<number | null>(null)
    const [userData, setUserData] = useState<IUserData[] | null>(null)
    const [userSelected, setUserSelected] = useState<number>(1)

    const fetchUserData = async (offset: number, limit: number, selected: number) =>
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.getUserDataWithOffsetAndLimit(offset, limit))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setUserSelected(selected)
                if (response) {
                    const userData: IUserData[] = response
                    setUserData(userData)
                } else {
                    setUserData(null)
                }
            }, () => setUserData(null))


    const fetchUserCount = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.getUserCount)
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                if (response) {
                    const userCount: { userCount: number } = response
                    setUserCount(userCount.userCount)
                } else {
                    setUserCount(null)
                }
            }, () => setUserCount(null))
    }

    const userProps: IUserProps = {
        userData: userData,
        userCount: userCount,
        selected: userSelected,
        fetchUserData: fetchUserData,
        fetchUserCount: fetchUserCount
    }
    
    const [receivedMetadataCount, setReceivedMetadataCount] = useState<number | null>(null)
    const [receivedMetadata, setReceivedMetadata] = useState<IReceivedFileMetadata[] | null>(null)
    const [receivedSelected, setReceivedSelected] = useState<number>(1)

    const fetchReceivedMetadata = async (offset: number, limit: number, selected: number) =>
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getReceivedMetadataWithOffsetAndLimit(offset, limit))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setReceivedSelected(selected)
                if (response) {
                    const receivedMetadata: IReceivedFileMetadata[] = response
                    setReceivedMetadata(receivedMetadata)
                } else {
                    setReceivedMetadata(null)
                }
            }, () => setReceivedMetadata(null))


    const fetchReceivedMetadataCount = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getReceivedMetadataCount)
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                if (response) {
                    const receivedCount: { receivedCount: number } = response
                    setReceivedMetadataCount(receivedCount.receivedCount)
                } else {
                    setReceivedMetadataCount(null)
                }
            }, () => setReceivedMetadataCount(null))
    }

    const receivedProps: IReceivedProps = {
        changedLayout: changedLayout,
        receivedMetadata: receivedMetadata,
        receivedMetadataCount: receivedMetadataCount,
        selected: receivedSelected,
        fetchReceivedMetadata: fetchReceivedMetadata,
        fetchReceivedMetadataCount: fetchReceivedMetadataCount
    }
    
    useEffect(() => {
        if (isAuthed) {
            fetchFileMetadataInfo()
            fetchFileMetadata(0, FILE_CHUNK_SIZE, 1)
            fetchSharedMetadataCount()
            fetchSharedMetadata(0, SHARE_CHUNK_SIZE, 1)
            fetchReceivedMetadataCount()
            fetchReceivedMetadata(0, RECEIVED_CHUNK_SIZE, 1)
            if (isAdmin) {
                fetchUserCount()
                fetchUserData(0, USER_CHUNK_SIZE, 1)
            }
        }
    }, [])

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
                        <div className="route-holder">
                            <Switch>
                                <Route exact path={ROUTES.test} component={() => <Test />} />

                                <Route exact path={ROUTES.myFiles} component={() => <MyFiles {...myFilesProps} />} />
                                <Route exact path={ROUTES.receivedFiles} component={() => <ReceivedFiles {...receivedProps} />} />
                                <Route exact path={ROUTES.sharedFiles} component={() => <SharedFiles  {...sharedProps} />} />

                                {isAdmin &&
                                    <Route exact path={ROUTES.sendNewsletter} component={() => <Newsletter />} />
                                }
                                {isAdmin &&
                                    <Route exact path={ROUTES.users} component={() => <Users {...userProps} />} />
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

