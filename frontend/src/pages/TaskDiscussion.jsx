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
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskRes = await axios.get(`/api/task/${taskId}`);
        setTask(taskRes.data);

        const enrichedUsers = await Promise.all(
          taskRes.data.users.map(async (user)=>{
            try{
              
              const clerkRes = await axios.get(`/api/clerk/user/${user.clerkId}`);
              const clerkUser = clerkRes.data;
              return {
                userid: user,
                userName: clerkUser.first_name && clerkUser.last_name
                  ? `${clerkUser.first_name} ${clerkUser.last_name}`
                  : clerkUser.email.split("@")[0],
                avatar: clerkUser.image_url
              };
            }
            catch{
              return {
                userid : user,
                userName: "User",
                avatar: ""
              };
            }
          })
        )
        setUsers(enrichedUsers);
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

        <Paper
          sx={{
            p: 3,
            mb: 4,
            border: task.completed ? "none" : "2px solid #ffb300",
            bgcolor: task.completed ? "#f5f5f5" : "#fffde7",
          }}
        >
          <Typography variant="h6" gutterBottom>{task.name}</Typography>
          <Typography>Description: {task.description}</Typography>
          <Typography>Deadline: {new Date(task.deadline).toLocaleDateString()}</Typography>
          <Typography>
            Status:{" "}
            <strong style={{ color: task.completed ? "#388e3c" : "#f57c00" }}>
              {task.completed ? "Completed" : "Pending"}
            </strong>
          </Typography>

          {/* Assigned To section */}
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Assigned To:
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {users.length > 0 ? (
                users.map((u) => (
                  <Box key={u.userid} display="flex" alignItems="center" gap={1}>
                    <Avatar src={u.avatar} alt={u.userName} sx={{ width: 32, height: 32 }} />
                    <Typography>{u.userName}</Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No assignees found.</Typography>
              )}
            </Box>
          </Box>
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
