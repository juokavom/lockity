import PuffLoader from "react-spinners/PuffLoader";

export function LoadingSpinner() {
    return (
        <div className={"row align-items-center d-flex justify-content-center loading-spinner"} >
            <PuffLoader color={"#16558F"} loading={true} size={75} speedMultiplier={1.5} />
        </div>
    );
}