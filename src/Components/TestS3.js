import AWS from "aws-sdk";
import {
  ChonkyActions,
  ChonkyFileActionData,
  ChonkyDndFileEntryItem,
  ChonkyDndFileEntryType,
  FileArray,
  FileBrowser,
  FileData,
  FileList,
  FileNavbar,
  FileToolbar,
  FileContextMenu,
  setChonkyDefaults,
} from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import path from "path";
import React, { useCallback, useEffect, useState } from "react";
import { TargetBox } from "./TestDND";
// import { useStoryLinks } from "../util";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
//  setChonkyDefaults({ iconComponent: ChonkyIconFA });
import Modal from "react-modal";
import UploadDialog from "./UploadDialog";
import CreateFolderDialog from "./CreateFolderDialog";
// The AWS credentials below only have read-only access to the Chonky demo bucket.
// You will need to create custom credentials for your bucket.
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

const fetchS3BucketContents = (bucket, prefix) => {
  return s3
    .listObjectsV2({
      Bucket: bucket,
      Delimiter: "/",
      Prefix: prefix !== "/" ? prefix : "",
    })
    .promise()
    .then((response) => {
      const chonkyFiles = [];
      const s3Objects = response.Contents;
      const s3Prefixes = response.CommonPrefixes;

      if (s3Objects) {
        chonkyFiles.push(
          ...s3Objects.map((object) => ({
            id: object.Key,
            name: path.basename(object.Key),
            modDate: object.LastModified,
            size: object.Size,
          }))
        );
      }

      if (s3Prefixes) {
        chonkyFiles.push(
          ...s3Prefixes.map((prefix) => ({
            id: prefix.Prefix,
            name: path.basename(prefix.Prefix),
            isDir: true,
          }))
        );
      }

      return chonkyFiles;
    });
};

function deleteFile(selectedfiles) {
  let deleteObject = selectedfiles.map((k) => {
    if (k.isDir && k.isDir === true) {
      fetchS3BucketContents(BUCKET_NAME, k.id).then((temp) => {
        console.log("recurse delter", temp);
        deleteFile(temp);
      });
    }
    return { Key: k.id };
  });
  var options = {
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: deleteObject,
    },
  };

  console.log("delt arr", deleteObject);
  s3.deleteObjects(options, function (err, data) {
    if (err) {
      console.log("error", err);
      return;
      // return alert("There was an error deleting your photo: ", err.message);
    }
    console.log("delt res data", data);

    // alert("Successfully deleted photo.");
    // viewAlbum(albumName);
  });
}
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
const dowloadFiles = (selected) => {
  console.log("download", selected);

  const signedUrlExpireSeconds = 60 * 1; // your expiry time in seconds.
  selected.map((singleSelection) => {
    const url = s3.getSignedUrl("getObject", {
      Bucket: BUCKET_NAME,
      Key: singleSelection.id,
      Expires: signedUrlExpireSeconds,
    });
    console.log("url", url);
    window.open(url);
  });

  // s3.getObject({ Bucket: BUCKET_NAME, Key: "Sheet 17(w2).pdf" }, function (
  //   error,
  //   data
  // ) {
  //   if (error != null) {
  //     alert("Failed to retrieve an object: " + error);
  //   } else {
  //     alert("Loaded " + data.ContentLength + " bytes");
  //     // do something with data.Body
  //     console.log("data download", data);
  //   }
  // });
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");
const storyName = "AWS S3 Browser";
export const TestS3 = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [filesToBeUploaded, setfilesToBeUploaded] = useState("");
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }
  const [showFolderCreate, setShowFolderCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [error, setError] = useState(null);
  const [folderPrefix, setKeyPrefix] = useState("/");
  const [newFolderPrefix, setNewKeyPrefix] = useState("/");
  const [files, setFiles] = useState([]);
  const fileActions = React.useMemo(
    () => [
      ChonkyActions.CreateFolder, // Adds a button to the toolbar
      ChonkyActions.UploadFiles, // Adds a button
      ChonkyActions.DownloadFiles, // Adds a button
      // ChonkyActions.CopyFiles, // Adds a button and a shortcut: Ctrl+C
      ChonkyActions.DeleteFiles, // Adds a button and a shortcut: Delete
    ],
    []
  );

  useEffect(() => {
    fetchS3BucketContents(BUCKET_NAME, folderPrefix)
      .then(setFiles)
      .catch((error) => setError(error.message));
  }, [folderPrefix, setFiles, refreshFlag]);
  console.log("files exist", files);
  const folderChain = React.useMemo(() => {
    let folderChain;
    if (folderPrefix === "/") {
      folderChain = [];
    } else {
      let currentPrefix = "";
      folderChain = folderPrefix
        .replace(/\/*$/, "")
        .split("/")
        .map((prefixPart) => {
          currentPrefix = currentPrefix
            ? path.join(currentPrefix, prefixPart)
            : prefixPart;
          return {
            id: currentPrefix,
            name: prefixPart,
            isDir: true,
          };
        });
    }
    folderChain.unshift({
      id: "/",
      name: BUCKET_NAME,
      isDir: true,
    });
    return folderChain;
  }, [folderPrefix]);

  const handleFileAction = useCallback(
    (data) => {
      console.log("Actions", data);
      if (data.id === ChonkyActions.OpenFiles.id) {
        if (data.payload.files && data.payload.files.length !== 1) return;
        if (!data.payload.targetFile || !data.payload.targetFile.isDir) return;

        const newPrefix = `${data.payload.targetFile.id.replace(/\/*$/, "")}/`;
        console.log(`Key prefix: ${newPrefix}`);
        setKeyPrefix(newPrefix);
        setNewKeyPrefix(newPrefix);
      } else if (data.id === ChonkyActions.DeleteFiles.id) {
        deleteFile(data.state.selectedFilesForAction);
        handleRefresh();
        console.log("Delete", data.state.selectedFilesForAction);
      } else if (data.id === ChonkyActions.UploadFiles.id) {
        setShowUpload(true);
        handleRefresh();
        console.log("Delete", data.state.selectedFilesForAction);
      } else if (data.id === ChonkyActions.CreateFolder.id) {
        setShowFolderCreate(true);
        console.log("pref", folderPrefix);

        handleRefresh();
        // console.log("create", data.state.selectedFilesForAction);
      } else if (data.id === ChonkyActions.DownloadFiles.id) {
        dowloadFiles(data.state.selectedFilesForAction);
        console.log("pref", folderPrefix);

        handleRefresh();
        // console.log("create", data.state.selectedFilesForAction);
      }
    },
    [setKeyPrefix]
  );
  const handleRefresh = () => {
    setRefreshFlag(!refreshFlag);
  };
  const closeDiaglog = () => {
    setShowUpload(false);
  };
  const closeCreateDiaglog = () => {
    setShowFolderCreate(false);
  };
  return (
    <div className="story-wrapper">
      {/* <div>
        <button onClick={openModal}>Open Modal</button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2>Hello</h2>
          <button onClick={closeModal}>close</button>
          <input
            multiple
            type="file"
            onChange={(e) => setDroppedFiles(e.target.files)}
            name="files"
            placeholder="Choose file"
          />
          <DndProvider>
            <h2>Drag and drop any File</h2>
            <TargetBox onDrop={handleFileDrop} />
          </DndProvider>
          <button onClick={uploadFile}>Upload</button>
        </Modal>
      </div> */}
      <DndProvider backend={HTML5Backend}>
        {showFolderCreate && (
          <CreateFolderDialog
            FolderPrefix={folderPrefix}
            closeDialog={closeCreateDiaglog}
            refreshHandler={handleRefresh}
          />
        )}
        {showUpload && (
          <UploadDialog
            folderPrefix={folderPrefix}
            refreshHandler={handleRefresh}
            closeDialog={closeDiaglog}
          />
        )}
        <div className="story-description">
          <h1 className="story-title">SLL File Storage</h1>

          <div className="story-links">
            {/* {useStoryLinks([
            { gitPath: "2.x_storybook/src/demos/S3Browser.tsx" },
          ])} */}
          </div>
          {error && (
            <div className="story-error">
              An error has occurred while loading bucket:{" "}
              <strong>{error}</strong>
            </div>
          )}
        </div>
        <div style={{ height: "85vh" }}>
          <FileBrowser
            instanceId={storyName}
            files={files}
            folderChain={folderChain}
            onFileAction={handleFileAction}
            fileActions={fileActions}
          >
            <FileNavbar />
            <FileToolbar />
            <FileList />
            <FileContextMenu />
          </FileBrowser>
        </div>
      </DndProvider>
    </div>
  );
};
