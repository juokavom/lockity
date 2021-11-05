import { useState } from 'react';
import Dropzone from 'react-dropzone';

export default function FileUploader() {
    const [file, setFile] = useState<any>()

    const onDrop = (files: any) => {
        if (files.length > 0) {
            setFile(files)
        }
    }

    const upload = () => {

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