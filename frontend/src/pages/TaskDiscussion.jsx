import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  IconButton,
  Fade
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";

const TaskDiscussion = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskRes = await axios.get(`/api/task/${taskId}`);
        setTask(taskRes.data);
        const commentRes = await axios.get(`/api/task/${taskId}/comments`);

        const enrichedComments = await Promise.all(
          commentRes.data.map(async (comment) => {
            try {
              const clerkRes = await axios.get(`/api/clerk/user/${comment.userId}`);
              const clerkUser = clerkRes.data;
              return {
                ...comment,
                userName: clerkUser.first_name && clerkUser.last_name
                  ? `${clerkUser.first_name} ${clerkUser.last_name}`
                  : clerkUser.email.split("@")[0],
                avatar: clerkUser.image_url
              };
            } catch {
              return {
                ...comment,
                userName: "User",
                avatar: ""
              };
            }
          })
        );

        setComments(enrichedComments);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load task or comments", err);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/comments`, {
        taskId: taskId,
        userId: user?.id,
        text: newComment,
      });

      const clerkRes = await axios.get(`/api/clerk/user/${user?.id}`);
      const clerkUser = clerkRes.data;
      const enrichedComment = {
        ...res.data,
        userName: clerkUser.first_name && clerkUser.last_name
          ? `${clerkUser.first_name} ${clerkUser.last_name}`
          : clerkUser.email.split("@")[0],
        avatar: clerkUser.image_url
      };

      setComments(prev => [...prev, enrichedComment]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  if (loading || !task) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Fade in>
      <Box sx={{ p: 4, maxWidth: 800, mx: "auto", position: "relative" }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h4" gutterBottom>
          Task Details
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">{task.name}</Typography>
          <Typography>Description: {task.description}</Typography>
          <Typography>Deadline: {new Date(task.deadline).toLocaleDateString()}</Typography>
          <Typography>Status: {task.completed ? "Completed" : "Pending"}</Typography>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Comments
        </Typography>

        <List sx={{ mb: 2 }}>
          {comments.map((comment, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={comment.avatar} alt={comment.userName} />
                </ListItemAvatar>
                <ListItemText
                  primary={comment.userName || "User"}
                  secondary={comment.text}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>

        <Paper sx={{ p: 2 }}>
          <TextField
            label="Add a comment"
            multiline
            fullWidth
            minRows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleCommentSubmit}
          >
            Post
          </Button>
        </Paper>
      </Box>
    </Fade>
  );
};

export default TaskDiscussion;
