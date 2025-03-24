import React, { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ActionComments from "./ActionComments";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { Button, Stack, Avatar } from "@mui/material";
import CustomCard from "./Card";
import CommentService from "../services/CommentService";
import { useAuth } from "../contexts/AuthContext";
import { CommentType } from "../pages/VideoView";



interface CommentsProps {
  comments: CommentType[];
  handleInsertNode: (commentId: number, item: string) => void;
  handleEditNode: (commentId: number, value: string) => void;
  handleDeleteNode: (commentId: number) => void;
  setCommentsData: (commentData: CommentType[]) => void;
}

const formatTimeAgo = (timestamp: number | string): string => {
  if (!timestamp) return "Just now";

  let timeInMs = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;


  const now = Date.now();
  const diffInSeconds = Math.floor((now) / 1000 - timeInMs);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};


const commentService = new CommentService();

export const useNode = () => {
  const insertNode = (tree: CommentType, commentId: number, item: string, videoId: number): CommentType => {
    if (tree.id === commentId) {
      return {
        ...tree,
        items: [...(tree.items || []), { id: Date.now(), name: item, timestamp: Date.now(), items: [], video_id: videoId }],
      };
    }
    return {
      ...tree,
      items: tree.items ? tree.items.map((node) => insertNode(node, commentId, item, videoId)) : [],
    };
  };

  const editNode = (tree: CommentType, commentId: number, value: string, videoId: number): CommentType => {
    if (tree.id === commentId) {
      return { ...tree, name: value };
    }
    return {
      ...tree,
      items: tree.items ? tree.items.map((node) => editNode(node, commentId, value, videoId)) : [],
    };
  };

  const deleteNode = (tree: CommentType, commentId: number): CommentType | null => {
    if (tree.id === commentId) return null;
    return {
      ...tree,
      items: tree.items ? tree.items.filter((node) => node.id !== commentId).map((node) => deleteNode(node, commentId)!) : [],
    };
  };

  return { insertNode, editNode, deleteNode };
};

const Comments: React.FC<CommentsProps> = ({ comments, handleInsertNode, handleEditNode, handleDeleteNode, setCommentsData }) => {
  const [input, setInput] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(true);
  const inputRef = useRef<HTMLSpanElement | null>(null);
  const { getToken, user } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<{ [key: number]: string }>({});



  const videoID: string | undefined = useParams().id;
  if (!videoID) {
    console.error("Error: video_id is undefined")
  }
  useEffect(() => {
    if (editMode && editingCommentId !== null && inputRef.current) {
      inputRef.current.innerText = editedContent[editingCommentId] ?? comments.find(c => c.id === editingCommentId)?.content ?? '';
      inputRef.current.focus();
    }
  }, [editMode, editingCommentId]);

  const handleNewComment = () => {
    // setExpand(!expand);
    setShowInput(true);
  };

  const insertReply = (comments: CommentType[], parentId: number, newReply: CommentType): CommentType[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, newReply] };
      } else {
        return { ...comment, replies: insertReply(comment.replies, parentId, newReply) };
      }
    });
  };

  const onReplyComment = async (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>, parent_id: number) => {
    event.preventDefault()
    if (editMode) {
      handleEditNode(comments.id, inputRef.current?.innerText ?? "");
      setEditMode(false);
    } else {
      if (input.trim() === "") return;
      setExpand(true);
      const token = getToken();
      if (!token) { console.error("Error: Missing authentication token"); return; }
      if (!videoID) {
        console.error("Error: video_id is undefined");
        return;
      }

      const newTimestamp = Math.floor(Date.now() / 1000);

      console.log("Making API request with:", {
        video_id: videoID,
        content: input,
        token,
        parent_id,
        timestamp: newTimestamp
      });

      try {
        const response = await commentService.postComments(+videoID, input, token, parent_id, newTimestamp);
        if (response.success && response.data) {
          const newReply: CommentType = {
            id: response.data.id,
            user_id: response.data.user_id,
            user_name: user.username || "",
            parent_id: parent_id,
            content: input,
            replies: [],
            timestamp: newTimestamp
          };
          
          setCommentsData(prevComments => {
            const updatedComments = insertReply(prevComments, parent_id, newReply);
            console.log("Updated commentsData:", updatedComments);
            return updatedComments;
          });

          console.log("Comment posted successfully:", response);
        }
      } catch (error) {
        console.error("Failed to post comment:", error);
      }

      setShowInput(false);
      setInput("");
    }
  };


  const updateCommentContent = (
    comments: CommentType[],
    commentId: number,
    newContent: string,
    newTimestamp: number
  ): CommentType[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, content: newContent, timestamp: newTimestamp };
      } else if (comment.replies && comment.replies.length) {
        return { ...comment, replies: updateCommentContent(comment.replies, commentId, newContent, newTimestamp) };
      }
      return comment;
    });
  };

  return (
    <div className="comment-wrapper">
      {comments.map((comment) => (
        <div key={comment.id} className="comment-container">
          <CustomCard additionalClasses="flex flex-col align-center w-full p-5">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar src={comment.avatarUrl} alt={comment.name} />
              <Link to={`/profile/${comment.user_name || "anonymous"}`} style={{ textDecoration: "none", fontWeight: "bold", color: "#1DA1F2" }}>
                {comment.user_name || "anonymous"}
              </Link>
              <span
                dir="ltr"
                contentEditable={editMode && editingCommentId === comment.id}
                suppressContentEditableWarning
                ref={editingCommentId === comment.id ? inputRef : null}
                style={{
                    unicodeBidi: "plaintext",
                    whiteSpace: "pre-wrap",
                    outline: "none",
                    border: editMode && editingCommentId === comment.id ? "1px solid #ddd" : "none",
                    padding: "2px",
                    minHeight: "20px"
                  }}
                onInput={(e) => {
                  const text = (e.target as HTMLElement).innerText;
                  setEditedContent(prev => ({ ...prev, [comment.id]: text }));
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                      const newContent = editedContent[comment.id];
                      if (newContent.trim() !== "") {
                        const token = getToken();
                        if (!token) return console.error("No token");
                        try {
                          await commentService.editComment(comment.id, newContent, token);
                          setCommentsData(prev =>
                          updateCommentContent(prev, comment.id, newContent, Math.floor(Date.now() / 1000)));
                          handleEditNode(comment.id, newContent);
                          setEditMode(false);
                          setEditingCommentId(null);
                        } catch (err) {
                          console.error("Failed to edit comment", err);
                        }
                      }
                    }
                }}>
                {comment.content}
              </span>
            </div>

            <span style={{ fontSize: "12px", color: "#bbb", marginTop: "4px", display: "block" }}>
              {formatTimeAgo(comment.timestamp)}
            </span>

            <div style={{ display: "flex", marginTop: "20px" }}>
              <Stack direction="row" spacing={1.5}>
                <ActionComments className="reply" type={<>{expand ? <ArrowDropUp fontSize="medium" /> : <ArrowDropDown fontSize="medium" />} Reply</>} handleClick={handleNewComment} />
                <ActionComments
                  className="reply"
                  type="Edit"
                  handleClick={() => {
                    setEditedContent(prev => ({ ...prev, [comment.id]: comment.content }));
                    setEditMode(true);
                    setEditingCommentId(comment.id);
                  }} />
                <ActionComments className="reply" variant="outlined" color="error" type="Delete" handleClick={() => handleDeleteNode(comment.id)} />
              </Stack>
            </div>
          </CustomCard>

          {expand && (
            <div style={{ paddingLeft: "20px" }}>
              {showInput && (
                <div style={{ display: "flex", marginTop: "20px" }}>
                  <Stack direction="column" spacing={1} className="inputContainer">
                    <input
                      type="text"
                      className="inputContainer__input"
                      autoFocus onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onReplyComment(e as any, comment.id)}
                      placeholder="Type your reply here"
                    />
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" size='small' onClick={(event) => onReplyComment(event, comment.id)}>Add reply</Button>
                      <Button variant="outlined" size='small' className="p-2" onClick={() => setShowInput(false)}>Cancel</Button>
                    </Stack>
                  </Stack>
                </div>
              )}
              {comment.replies?.map((subComment) => (
                <Comments
                  key={subComment.id}
                  comments={[subComment]}
                  handleInsertNode={handleInsertNode}
                  handleEditNode={handleEditNode}
                  handleDeleteNode={handleDeleteNode}
                  setCommentsData={setCommentsData}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Comments;
