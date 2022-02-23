import React, { useCallback, useEffect, useState } from "react";
import { TargetBox } from "./TestDND";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AWS from "aws-sdk";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Input } from "@mui/material";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastCall } from "../Utilities/ToastCall";

import {
  ACCESS_KEY_ID,
  BUCKET_NAME,
  BUCKET_REGION,
  SECRET_ACCESS_KEY,
} from "../Utilities/AwsConfig";

AWS.config.update({
  region: BUCKET_REGION,
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

function UploadDialog({ folderPrefix, refreshHandler, closeDialog }) {
  toast.configure();
  const [droppedFiles, setDroppedFiles] = useState([]);
  const handleFileDrop = useCallback(
    (item) => {
      if (item) {
        const filesDrop = item.files;
        let temp = {};
        console.log("files", filesDrop);
        filesDrop.forEach((file, i) => {
          temp[i] = file;
        });
        temp["length"] = filesDrop.length;
        setDroppedFiles(temp);
        // if (!files.length) {
        //   return alert("Please choose a file to upload first.");
        // }

        // var file = files[0];
        // var fileName = file.name;
        // let albumName = "test";
        // console.log("folfer", folderPrefix);
        // var albumPhotosKey = encodeURIComponent(folderPrefix.trim()) + "/";

        // var photoKey = folderPrefix + fileName;
        // console.log("key", photoKey);
        // // Use S3 ManagedUpload class as it supports multipart uploads
        // var upload = new AWS.S3.ManagedUpload({
        //   params: {
        //     Bucket: BUCKET_NAME,
        //     Key: photoKey,
        //     Body: file,
        //   },
        // });

        // var promise = upload.promise();

        // promise.then(
        //   function (data) {
        //     alert("Successfully uploaded photo.");
        //     // viewAlbum(albumName);
        //     console.log("REs data", data);
        //   },
        //   function (err) {
        //     console.log("upload error", err);
        //     return alert(
        //       "There was an error uploading your photo: ",
        //       err.message
        //     );
        //   }
        // );
      }
    },
    [setDroppedFiles, folderPrefix]
  );
  const [progressList, setProgressList] = useState({});
  const uploadFile = () => {
    console.log("drop files", droppedFiles);
    if (!droppedFiles.length) {
      return alert("Please choose a file to upload first.");
    }
    // console.log("drop files", droppedFiles);
    for (let i = 0; i < droppedFiles.length; i++) {
      console.log("fike", droppedFiles[i]);
      var fileName = droppedFiles[i].name;
      let albumName = "test";
      console.log("folfer", folderPrefix);
      var albumPhotosKey =
        folderPrefix === "/"
          ? "/"
          : encodeURIComponent(folderPrefix.trim()) + "/";

      var photoKey = folderPrefix === "/" ? fileName : folderPrefix + fileName;
      console.log("key", photoKey);
      //   Use S3 ManagedUpload class as it supports multipart uploads
      var opts = { queueSize: 1, partSize: 1024 * 1024 * 10 };
      var upload = new AWS.S3.ManagedUpload({
        params: {
          Bucket: BUCKET_NAME,
          Key: photoKey,
          Body: droppedFiles[i],
        },
        options: opts,
      });
      // let temp = progressList;
      // console.log(`File progress ${i}:outside `, temp);
      AWS.config.httpOptions.timeout = 0;
      upload
        .on("httpUploadProgress", function (evt) {
          let temp = progressList;
          console.log("data from event", evt);
          var uploaded = Math.round((evt.loaded / evt.total) * 100);
          console.log(`File uploaded ${i}: ${uploaded}%`);
          let nm = evt.key.split("/");
          nm = nm[nm.length - 1];
          temp[i] = { name: nm, progress: uploaded };
          console.log(`File progress ${i}: %`, temp);
          setProgressList(temp);
          return nm;
        })
        .send(function (err, data) {
          if (err) {
            // an error occurred, handle the error
            toastCall("error", "Upload Failed");
            console.log(err);
            return;
          }
          toastCall("success", "Uploaded");
          console.log("data from upload", data);
          refreshHandler();
          // closeDialog();
        });

      // var promise = upload.promise();

      // promise.then(
      //   function (data) {
      //     console.log("Successfully uploaded photo.");
      //     // viewAlbum(albumName);
      //     console.log("REs data", data);
      //     refreshHandler();
      //     closeDialog();
      //   },
      //   function (err) {
      //     console.log("upload error", err);
      //     return alert(
      //       "There was an error uploading your photo: ",
      //       err.message
      //     );
      //   }
      // );
    }
  };
  const cancelUploadFile = () => {
    setDroppedFiles([]);
    closeDialog();
  };

  const [filetext, setFiletext] = useState("");
  useEffect(() => {
    console.log("Droped", droppedFiles);
    let temp = "";
    Object.keys(droppedFiles).map((ke) => {
      if (ke !== "length") {
        temp += droppedFiles[ke].name + " ";
      } else {
        temp += droppedFiles[ke] + " ";
      }
    });
    setFiletext(temp);
  }, [droppedFiles]);
  useEffect(() => {
    console.log("list", progressList);
  }, [progressList]);

  return (
    <div>
      <Dialog open={true} onClose={closeDialog}>
        <DialogTitle>Upload</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here.
            We will send updates occasionally.
          </DialogContentText> */}
          <input
            multiple
            type="file"
            onChange={(e) => setDroppedFiles(e.target.files)}
            fullWidth
            variant="standard"
          />
          <TargetBox onDrop={handleFileDrop} />
          <DialogContentText>{`${filetext} files selected`}</DialogContentText>
          <Box sx={{ width: "100%" }}>
            {}
            {Object.keys(progressList).map((i) => (
              <>
                <Typography variant="h6" component="h6">
                  {progressList[i].name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressList[i].progress}
                />
              </>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={uploadFile}>Upload</Button>
          <Button onClick={cancelUploadFile}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
    // <div>
    //   <input
    //     multiple
    //     type="file"
    //     onChange={(e) => setDroppedFiles(e.target.files)}
    //     name="files"
    //     placeholder="Choose file"
    //   />
    //   {/* <DndProvider backend={HTML5Backend}> */}
    //   <h2>Drag and drop any File</h2>
    //   <TargetBox onDrop={handleFileDrop} />

    //   {/* </DndProvider> */}
    //   <button onClick={uploadFile}>Upload</button>
    //   <button onClick={cancelUploadFile}>Cancel</button>
    // </div>
  );
}

export default UploadDialog;
