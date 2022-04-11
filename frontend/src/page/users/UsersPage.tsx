import {
    Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { USER_CHUNK_SIZE } from '../../model/Constants';
import { useTypedSelector } from '../../redux/Store';
import CustomPagination from '../main/components/PaginationComponent';
import { CreateUser } from './component/CreateUserComponent';
import { DeleteUser } from './component/DeleteUserComponent';
import { EditUser } from './component/EditUserComponent';
import { IUserData, IUserModalProps, UserAction } from './model/UsersModel';
import { fetchUserCount, fetchUserData } from './request/UsersRequests';

export function UsersPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        userData: IUserData | null
    } | null>(null)

    const dispatch = useDispatch()
    const userState = useTypedSelector((state) => state.userReducer)

    const fetchData = () => {
        dispatch(fetchUserCount())
        dispatch(fetchUserData(0, USER_CHUNK_SIZE, 1))
    }

    useEffect(() => {
        if (!userState.fetched) {
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
            if (modalData.action === UserAction.Create) return (<CreateUser {...{ callback: modalCallback }} />);
            else if (modalData.userData) {
                const modalProps: IUserModalProps = {
                    userData: modalData.userData,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case UserAction.Edit:
                        return (<EditUser {...modalProps} />);
                    case UserAction.Delete:
                        return (<DeleteUser {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const UserFileRow = (userData: IUserData) => (
        <tr>
            <td>{userData.email}</td>
            <td>{userData.role}</td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: UserAction.Edit,
                            userData: userData
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Edit
                </Button>
            </td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: UserAction.Delete,
                            userData: userData
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Delete
                </Button>
            </td>
        </tr>
    );

    const UserRows = () => {
        if (userState.userDatas) {
            return userState.userDatas?.map((uData: IUserData) => {
                return (
                    <UserFileRow key={uData.id} {...uData} />
                );
            })
        }
        return null
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center" style={{ marginBottom: "1rem" }}>
                <Box className="col-8 col-md-6 col-lg-4" component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ color: "#ebf0f", width: "100%" }}
                        onClick={() => {
                            setModalData({
                                action: UserAction.Create,
                                userData: null
                            })
                            selectActionJsx()
                            toggleModal()
                        }}>
                        Create user
                    </Button>
                </Box>
            </div>
            <Modal className="container" size="" isOpen={modalOpen} toggle={() => { toggleModal() }}>
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
                userState.userDatas && userState.userDatas.length !== 0 ?
                    <div className="row align-items-center d-flex justify-content-center">
                        <table className="table table-hover table-ellipsis">
                            <thead>
                                <tr>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                    <th style={{ width: "10%" }}></th>
                                    <th style={{ width: "10%" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {UserRows()}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="container">
                        <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                            <div className="col-auto">
                                <h5><i>There are no users</i></h5>
                            </div>
                        </div>
                    </div>
            }
            {
                userState.userCount && userState.userCount > 0 ? <CustomPagination {...{
                    total: userState.userCount,
                    chunkSize: USER_CHUNK_SIZE,
                    selected: userState.pageSelected,
                    fetchItems: (offset: number, limit: number, selected: number) => dispatch(fetchUserData(offset, limit, selected))
                }} /> : <div></div>
            }
        </div>
    );
}