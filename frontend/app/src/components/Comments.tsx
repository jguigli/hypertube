import React, { useState } from "react";
import ActionComments from "./ActionComments";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

interface CommentType {
  id: number;
  name?: string;
  items?: CommentType[];
}

interface CommentsProps {
  comments: CommentType;
  handleInsertNode: (commentId: number, item: string) => void;
  handleEditNode: (commentId: number, value: string) => void;
  handleDeleteNode: (commentId: number) => void;
}

export const useNode = () => {
  const insertNode = (tree: CommentType, commentId: number, item: string): CommentType => {
    if (tree.id === commentId) {
      return {
        ...tree,
        items: [...(tree.items || []), { id: Date.now(), name: item, items: [] }],
      };
    }

    return {
      ...tree,
      items: tree.items ? tree.items.map((node) => insertNode(node, commentId, item)) : [],
    };
  };

  const editNode = (tree: CommentType, commentId: number, value: string): CommentType => {
    if (tree.id === commentId) {
      return { ...tree, name: value };
    }

    return {
      ...tree,
      items: tree.items ? tree.items.map((node) => editNode(node, commentId, value)) : [],
    };
  };

  const deleteNode = (tree: CommentType, commentId: number): CommentType | null => {
    if (tree.id === commentId) {
      return null;
    }

    return {
      ...tree,
      items: tree.items ? tree.items.filter((node) => node.id !== commentId).map((node) => deleteNode(node, commentId)!) : [],
    };
  };

  return { insertNode, editNode, deleteNode };
};

const Comments: React.FC<CommentsProps> = ({ comments, handleInsertNode, handleEditNode, handleDeleteNode }) => {
  const [input, setInput] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(false);

  const handleNewComment = () => {
    setExpand(!expand);
    setShowInput(true);
  };

  const onAddComment = () => {
    if (input.trim() === "") return;
    setExpand(true);
    handleInsertNode(comments.id, input);
    setShowInput(false);
    setInput("");
  };

  return (
    <div>
      <div className={comments.id === 1 ? "inputcontainer" : "commentContainer"}>
        {comments.id === 1 ? (
          <>
            <input
              type="text"
              className="inputContainer__input first_input"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your comment here"
              style={{ marginRight: "10px" }}
            />
            <Button variant="contained" onClick={onAddComment}>Add your comment</Button>
          </>
        ) : (
          <>
            <span style={{ wordWrap: "break-word" }}>{comments.name}</span>
            <div style={{ display: "flex", marginTop: "5px" }}>
              {editMode ? (
                <>
                <Stack direction="row" spacing={1.5}>
                  <ActionComments
                    className="reply"
                    type="Save"
                    handleClick={() => handleEditNode(comments.id, input)}
                    style={{ marginRight: "10px", display: "flex", alignItems: "center" }}
                  />
                  <ActionComments
                    className="reply"
                    type="Cancel"
                    handleClick={() => setEditMode(false)}
                    style={{ marginRight: "10px", display: "flex", alignItems: "center" }}
                  />
                </Stack>
                </>
              ) : (
                <>
                  <Stack direction="row" spacing={1.5}>
                    <ActionComments
                      className="reply"
                      type={
                        <>
                          {expand ? <ArrowDropUp fontSize="medium" /> : <ArrowDropDown fontSize="medium" />} Reply
                        </>
                      }
                      handleClick={handleNewComment}
                    />
                    <ActionComments
                      className="reply"
                      type="Edit"
                      handleClick={() => setEditMode(true)}
                    />
                    <ActionComments
                      className="reply"
                      type="Delete"
                      handleClick={() => handleDeleteNode(comments.id)}
                    />
                  </Stack>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ display: expand ? "block" : "none", paddingLeft: 25 }}>
        {showInput && (
          <div className="inputcontainer">
            <input
              type="text"
              className="inputContainer__input"
              autoFocus
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your reply here"
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={onAddComment}>Add reply</Button>
              <Button variant="outlined" className="reply comment" onClick={() => setShowInput(false)}>
                Cancel
              </Button>
            </Stack>
          </div>
        )}
        {comments.items?.map((cmnt) => (
          <Comments
            key={cmnt.id}
            handleInsertNode={handleInsertNode}
            handleEditNode={handleEditNode}
            handleDeleteNode={handleDeleteNode}
            comments={cmnt}
          />
        ))}
      </div>
    </div>
  );
};

export default Comments;
