import React, { useState } from "react";
import AWS from "aws-sdk";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
export default function CreateFolderDialog({
  FolderPrefix,
  closeDialog,
  refreshHandler,
}) {
  const [folderName, setFolderName] = useState("");
  function createFolder() {
    let albumName = folderName.trim();
    if (!albumName) {
      return alert(
        "Album names must contain at least one non-space character."
      );
    }
    if (albumName.indexOf("/") !== -1) {
      return alert("Album names cannot contain slashes.");
    }
    var albumKey =
      FolderPrefix === "/" ? albumName + "/" : FolderPrefix + albumName + "/";
    var params = {
      Bucket: BUCKET_NAME,
      Key: albumKey,
    };
    console.log("FOlder create key", albumKey);
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log("folder create", err);
        return alert("There was an error creating your album: " + err.message);
      }
      console.log("create folder data", data);
      refreshHandler();
      alert("Successfully created album.");
      closeDialog();
      // viewAlbum(albumName);
    });
  }
  return (
    <div>
      <Dialog open={true} onClose={closeDialog}>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here.
            We will send updates occasionally.
          </DialogContentText> */}
          <TextField
            autoFocus
            onChange={(e) => setFolderName(e.target.value)}
            margin="dense"
            id="name"
            label="Folder Name"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={createFolder}>Create</Button>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
    //   <input type="text" onChange={(e) => setFolderName(e.target.value)} />
    //   <button onClick={createFolder}>Create</button>
    //   <button onClick={closeDialog}>Cancel</button>
  );
}
