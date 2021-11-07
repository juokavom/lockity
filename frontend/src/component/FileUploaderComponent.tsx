import { useState } from 'react';
import Dropzone from 'react-dropzone';
import { ENDPOINTS } from '../model/Server';

export default function FileUploader() {
    const [file, setFile] = useState<any>()

    const onDrop = (files: any) => {
        if (files.length > 0) {
            setFile(files)
            console.log('set file!')
        }
    }

    const upload = () => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file[0], file[0].name)

        xhr.upload.onprogress = event => {
            const percentages = +((event.loaded / event.total) * 100).toFixed(2);
            console.log(percentages)
        }

        xhr.onreadystatechange = (ev: Event) => {
            console.log('File upload state change = ', ev)
        }

        xhr.open("POST", ENDPOINTS.FILE.fileAnonymous(true));        
        xhr.send(formData);
    }

    return (
        <div>
            <Dropzone onDrop={onDrop} multiple={false}>
                {({ getRootProps, getInputProps }: any) => (
                    <section>
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            {file && file[0].name ? (
                                <div className="selected-file ellipse-text">
                                    {file && file[0].name}
                                </div>
                            ) : (
                                'Drag and drop file here, or click to select file'
                            )}
                        </div>
                        <aside className="selected-file-wrapper">
                            <button
                                className="upload-button"
                                disabled={!file}
                                onClick={upload}
                            >
                                Upload
                            </button>
                        </aside>
                    </section>
                )}
            </Dropzone>
        </div>
    );
}