

 import {
    ChonkyDndFileEntryItem,
    ChonkyDndFileEntryType,
    FileArray,
    FullFileBrowser,
    setChonkyDefaults,
} from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import React, { useState,useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// import { useStoryLinks } from '../util';

// setChonkyDefaults({ iconComponent: ChonkyIconFA });

import type { CSSProperties, FC } from 'react'
import { NativeTypes } from 'react-dnd-html5-backend'
import { useDrop, DropTargetMonitor } from 'react-dnd'

const style: CSSProperties = {
  border: '1px solid gray',
  height: '15rem',
  width: '30rem',
  padding: '2rem',
  textAlign: 'center',
  top:".5rem",
}

export interface TargetBoxProps {
  onDrop: (item: { files: any[] }) => void
}

export const TargetBox: FC<TargetBoxProps> = (props) => {
  const { onDrop } = props
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: any[] }) {
        if (onDrop) {
          onDrop(item)
        }
      },
      canDrop(item: any) {
        console.log('canDrop', item.files, item.items)
        return true
      },
      hover(item: any) {
        console.log('hover', item.files, item.items)
      },
      collect: (monitor: DropTargetMonitor) => {
        const item = monitor.getItem() as any
        if (item) {
          console.log('collect', item.files, item.items)
        }

        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }
      },
    }),
    [props],
  )

  const isActive = canDrop && isOver
  return (
    <div ref={drop} style={style}>
      {isActive ? 'Release to drop' : 'Drag file here'}
    </div>
  )
}


const storyName = 'Advanced drag & drop';
export const TestDND: React.FC = () => {
    const files: FileArray = [
        { id: 'aapl', name: 'config.yml' },
        { id: 'goog', name: 'snip.png' },
        { id: 'amzn', name: 'weights.hdf5' },
        { id: 'msft', name: 'binaries.tar.gz' },
        { id: 'nflx', name: '.local', isDir: true, isHidden: true },
    ];
    const folderChain: FileArray = [
        { id: 'zxc', name: 'Folder', isDir: true },
        { id: 'ktr', name: 'Subfolder', isDir: true, droppable: false },
        null,
        { id: 'dfg', name: 'Subsubsubfolder', isDir: true },
    ];
    const [droppedFiles, setDroppedFiles] = useState<File[]>([])

  const handleFileDrop = useCallback(
    (item) => {
      if (item) {
        const files = item.files
        console.log("files",files)
        setDroppedFiles(files)
      }
    },
    [setDroppedFiles],
  )


    return (
        <div className="story-wrapper">
            <div className="story-description">
                <h1 className="story-title">{storyName}</h1>
                <p>
                    This example shows how you can define a custom drag & drop (DnD)
                    drop-zone for Chonky. Chonky uses a very powerful DnD library called{' '}
                    <a href="https://github.com/react-dnd/react-dnd">
                        <code>react-dnd</code>
                    </a>
                    . Check out{' '}
                    <a href="https://react-dnd.github.io/react-dnd/">
                        <code>react-dnd</code> documentation
                    </a>{' '}
                    to see how to use the advanced DnD features.
                </p>
               
            </div>
            <DndProvider backend={HTML5Backend}>
                <TargetBox onDrop={handleFileDrop} />
                <div style={{ height: 300 }}>
                    <FullFileBrowser
                        files={files}
                        folderChain={folderChain}
                        
                    />
                </div>
            </DndProvider>
        </div>
    );
};
