import { Progress } from "reactstrap"
import { formatBytes, StorageData } from "../model/FileModels"

export const StorageStatusBar = ({ totalSize, usedSize }: StorageData): JSX.Element => {
    const percentage = usedSize * 100 / totalSize
    let color = "info"

    if (percentage > 80) color = "danger"
    else if (percentage > 50) color = "warning"
    else if (percentage > 20) color = "success"

    return (
        <div className="text-center">
            {formatBytes(usedSize)} / {formatBytes(totalSize)}
            <Progress animated color={color} value={percentage}>
                {Math.trunc(percentage)}%
            </Progress>
        </div>
    );
}