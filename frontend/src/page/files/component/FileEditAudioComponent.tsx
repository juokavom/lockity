import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import { IconButton, Slider, SliderThumb, Stack } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { Region, WaveForm, WaveSurfer } from "wavesurfer-react"
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min"
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min"
import { ENDPOINTS } from '../../../model/Server'
import { bufferToWave, dataURItoBlob, fetchToDataURL, fileTitleToFormat, IFileModalProps, IWavesurferProps } from "../model/FileModels"
import { uploadEditedFileBlob } from '../request/FilesRequests'

const VolumeSlider = ({ wavesurferRef }: IWavesurferProps) => {
    const VolumeSlider = styled(Slider)(({ theme }) => ({
        color: "#3a8589",
        width: 3,
        padding: "0 13px",
        "& .MuiSlider-thumb": {
            height: 27,
            width: 27,
            backgroundColor: "#fff",
            border: "1px solid currentColor",
            "&:hover": {
                boxShadow: "0 0 0 8px rgba(58, 133, 137, 0.16)"
            },
            "& .airbnb-bar": {
                height: 1,
                width: 15,
                backgroundColor: "currentColor",
                marginTop: 1.5,
                marginBottom: 1.5
            }
        },
        "& .MuiSlider-track": {
            width: 3
        },
        "& .MuiSlider-rail": {
            color: theme.palette.mode === "dark" ? "#bfbfbf" : "#d8d8d8",
            opacity: theme.palette.mode === "dark" ? undefined : 1,
            width: 3
        }
    }));

    return (
        <div className="col-auto pb-4" style={{ textAlign: "center" }}>
            <div style={{ height: 150 }}>
                <VolumeSlider
                    components={{
                        Thumb: (props) => {
                            const { children, ...other } = props;
                            return (
                                <SliderThumb {...other}>
                                    {children}
                                    <div>
                                        <div className="airbnb-bar" />
                                        <div className="airbnb-bar" />
                                        <div className="airbnb-bar" />
                                    </div>
                                </SliderThumb>
                            );
                        }
                    }}
                    orientation={"vertical"}
                    onChange={(e) => {
                        // @ts-ignore
                        wavesurferRef.current.setVolume(e.target.value)
                    }}
                    defaultValue={1}
                    step={0.05}
                    min={0}
                    max={2}
                />
            </div>
            <p className="pt-2" style={{ height: 24 }}>Volume</p>
        </div>
    );
}

export const FileEditAudio = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [filtersData, setFiltersData] = useState<JSX.Element[]>([])
    const [volumeData, setVolumeData] = useState<JSX.Element | null>()
    const [region, setRegion] = useState({
        id: `mainRegion`,
        start: 0,
        end: 0,
        color: `rgba(153, 255, 204, 0.5)`
    })

    const plugins = useMemo(() => {
        return [
            {
                plugin: RegionsPlugin,
                options: {
                    dragSelection: false,
                }
            },
            {
                plugin: TimelinePlugin,
                options: {
                    container: "#timeline"
                }
            }
        ].filter(Boolean);
    }, []);

    const wavesurferRef = useRef();

    const initRegion = () => {
        // @ts-ignore
        setRegion({ ...region, start: 0, end: wavesurferRef.current.getDuration() })
    }

    const initFilters = () => {
        const filters = [60, 250, 1200, 4000, 16000].map((hz) => {
            // @ts-ignore
            const filter = wavesurferRef.current.backend.ac.createBiquadFilter();
            filter.type = "peaking"
            filter.gain.value = 0
            filter.Q.value = 1
            filter.frequency.value = hz
            return filter
        })

        // @ts-ignore
        wavesurferRef.current.backend.setFilters(filters);

        const filtersJsx = filters?.map((filter): JSX.Element => {
            const formattedHz = filter.frequency.value >= 1000 ?
                filter.frequency.value / 1000 + "kHz" : filter.frequency.value + "Hz"
            return (
                <div key={filter.frequency.value + '-' + Date.now()}
                    className="col-auto pb-4" style={{ textAlign: "center" }}>
                    <div style={{ height: 150 }}>
                        <Slider
                            onChange={(e) => {
                                //@ts-ignore
                                filter.gain.value = ~~e.target.value
                            }}
                            defaultValue={0}
                            orientation="vertical"
                            step={5}
                            marks
                            min={-50}
                            max={50}
                        />
                    </div>
                    <p className="pt-2" style={{ height: 24 }} >{formattedHz}</p>
                </div>
            )
        })

        setFiltersData(filtersJsx)
        setVolumeData(<VolumeSlider key={"vol-" + Date.now()} {...{ wavesurferRef }} />)
        // @ts-ignore
        wavesurferRef.current.setVolume(1)

        // @ts-ignore
        wavesurferRef.current.filters = filters;
    }

    const handleWSMount = useCallback((waveSurfer) => {
        if (waveSurfer.markers) {
            waveSurfer.clearMarkers();
        }

        wavesurferRef.current = waveSurfer;

        if (wavesurferRef.current) {
            fetchToDataURL(ENDPOINTS.FILE.streamWithFileId(fileMetadata.id), (response) => {
                // @ts-ignore
                wavesurferRef.current.loadBlob(dataURItoBlob(response));
            })

            // @ts-ignore
            wavesurferRef.current.on("ready", () => {
                initFilters()
                initRegion()
                window.dispatchEvent(new Event('resize'));
            });
        }
    }, [fileMetadata.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (wavesurferRef.current !== null) {
            // @ts-ignore
            setIsPlaying(wavesurferRef.current.isPlaying())
        }
        return () => {
            // @ts-ignore
            wavesurferRef.current.destroy();
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const playAndPause = () => {
        // @ts-ignore
        wavesurferRef.current.playPause();
        setIsPlaying(!isPlaying)
    }

    const stop = () => {
        // @ts-ignore
        wavesurferRef.current.stop();
        setIsPlaying(false)
    }

    const reset = () => {
        stop()
        initRegion()
        initFilters()
        setIsPlaying(false)
    }

    const handleRegionUpdate = useCallback((editedRegion, smth) => {
        setRegion(editedRegion)
    }, []);

    const buttons = (
        <>
            <div className="col-auto">
                <IconButton onClick={playAndPause}>
                    {isPlaying && <PauseCircleFilledIcon fontSize='large' />}
                    {!isPlaying && <PlayCircleFilledWhiteIcon fontSize='large' />}
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton onClick={stop}>
                    <StopCircleIcon fontSize='large' />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton onClick={reset}>
                    <RestartAltIcon fontSize='large' />
                </IconButton>
            </div>
        </>
    );

    return (
        <div className="container" >
            <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                <WaveForm id="waveform" hideCursor fillParent={true}
                    cursorColor="transparent" waveColor="rgba(255, 0, 0, 0.5)"
                    progressColor="rgba(0, 0, 255, 0.5)" responsive={true}>
                    <Region
                        onUpdateEnd={handleRegionUpdate}
                        key={region.id}
                        {...region}
                    />
                </WaveForm>
            </WaveSurfer>
            <div id="timeline" />
            <div className="row align-items-center d-flex justify-content-center m-2">
                {buttons}
            </div>
            <Stack className="row align-items-center d-flex justify-content-center m-2"
                spacing={2} direction="row">
                {filtersData}
                {volumeData}
            </Stack>
            <div className="selected-file-wrapper">
                <Button
                    type="submit"
                    variant="contained"
                    className="upload-button"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={async () => {
                        // @ts-ignore
                        let offlineCtx = new OfflineAudioContext(wavesurferRef.current.backend.buffer.numberOfChannels, wavesurferRef.current.backend.buffer.length, wavesurferRef.current.backend.buffer.sampleRate);
                        let obs = offlineCtx.createBufferSource();
                        // @ts-ignore
                        obs.buffer = wavesurferRef.current.backend.buffer;
                        let gain = offlineCtx.createGain();
                        // @ts-ignore
                        gain.gain.value = wavesurferRef.current.getVolume();
                        // @ts-ignore
                        const filters = wavesurferRef.current.backend.filters.map((appliedFilter) => {
                            // @ts-ignore
                            const filter = offlineCtx.createBiquadFilter();
                            filter.type = "peaking"
                            filter.gain.value = appliedFilter.gain.value
                            filter.Q.value = 1
                            filter.frequency.value = appliedFilter.frequency.value
                            return filter
                        })
                        obs.connect(filters[0])
                        for (var i = 0; i < filters.length - 1; i++) {
                            filters[i].connect(filters[i + 1])
                        }
                        filters[filters.length - 1].connect(gain).connect(offlineCtx.destination)
                        obs.start();
                        await offlineCtx.startRendering().then(r => {
                            const format = "audio/" + fileTitleToFormat(fileMetadata.title)
                            const audioOffset = Math.floor(region.start * r.sampleRate)
                            const audioLength = Math.floor((region.end - region.start) * r.sampleRate)
                            const audioBlob = bufferToWave(r, audioOffset, audioLength, format);
                            uploadEditedFileBlob(fileMetadata.id, fileMetadata.title, audioBlob,
                                "Your audio was edited successfully!", callback)
                        });
                    }}>
                    Save
                </Button>
            </div>
        </div>
    );
}