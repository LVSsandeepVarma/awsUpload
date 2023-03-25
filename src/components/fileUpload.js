import React, { useState } from "react";
import AWS from "aws-sdk";
import { FileUploader } from "react-drag-drop-files";
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";

const awsBucket = "personateaifileupload";
const regeion = "ap-south-1";

AWS.config.update({
  accessKeyId: "AKIARWEANQKEQBZX44HL",
  secretAccessKey: "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",
});

const bucket = new AWS.S3({
  params: { Bucket: awsBucket },
  region: regeion,
});

function VideoUpload() {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState();
  const [uploadStatus, setUploadStatus] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState(undefined);
  const allowedTypes = ["MP4"];

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleFileUpload = (file) => {
    if(file !== undefined){
        const params = {
        Body: file,
        Key: file.name,
        ContentType: "video/mp4",
        Bucket: awsBucket,
        };

        bucket
        .putObject(params)
        .on("httpUploadProgress", (evt) => {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
        })
        .send((err, data) => {
            if (err) {
            setError(err);
            setUploadStatus(false);
            } else {
            setUploadStatus(true);

            const urlparamas = {
                Bucket: awsBucket,
                Key: file.name,
                Expires: 3600,
            };

            const presignedUrl = bucket.getSignedUrl("getObject", urlparamas);


            bucket.getObject({ Key: file.name }, function (err) {
                if (err) {
                } else {
                setUrl(presignedUrl);
                }
            });
            }
        });
    }else{
        setError("upload file before uploading!!! ")
    }
  };

  return (
    <div className="fileUploader">
      <h1 className="heading">Upoad your mp4 file to view</h1>
      <div className="drag-drop-wrapper">
        <FileUploader
          classes="uploadArea"
          onDrop={(file) => {
            handleFileChange(file);
          }}
          label="Drag or Drop your file here"
          maxSize="2048"
          minSize="1"
          types={allowedTypes}
          handleChange={(file) => {
            handleFileChange(file);
          }}
          onTypeError={(err) => {
            console.log(err);
          }}
          dropMessageStyle={{ backgroundColor: "white", opacity: 0.5 }}
        />
        <Button
          className="Button"
          onClick={() => {
            handleFileUpload(selectedFile);
          }}
        >
          Upload
        </Button>
      </div>

      <div className="fileProgress">
        {progress === 100 ? (
          <h1 className="heading">uploaded successfully</h1>
        ) : progress !== 0 ? (
          <ProgressBar
            striped
            now={progress}
            label={`${progress}% completed`}
          ></ProgressBar>
        ) : (
          ""
        )}
      </div>
      {uploadStatus ? (
        <div>
          <p className="header">
            uploaded file :{" "}
            <a
              style={{ color: "yellow" }}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              click to view in new page
            </a>
          </p>
          {uploadStatus ? (
            <video
              width={700}
              height={700}
              autoPlay={true}
              loop={true}
              controls={true}
              src={url}
            ></video>
          ) : (
            ""
          )}
          {error !== undefined ? <h1>err: {error}</h1> : ""}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default VideoUpload;
