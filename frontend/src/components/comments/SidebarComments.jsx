import React, { useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { 
  getCommentsByPost, 
  getCommentsByReel, 
  createCommentPost, 
  createCommentReel,
  getCommentRepliesByPost,
  getCommentRepliesByReel,
  createCommentReplyPost,
  createCommentReplyReel
} from '../../services/comments';
import { getUserProfile } from '../../services/users';
import { FaReply } from 'react-icons/fa';
import { FiFlag } from 'react-icons/fi';
import "../../assets/css/comments/SideComments.css";
import ModalReport from '../reports/modalReport';

const SidebarComments = ({ contentId, contentType, onClose }) => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = localStorage.getItem('userId');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [expandedComments, setExpandedComments] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            if (!contentId) return;
            
            try {
                setIsLoading(true);
                let fetchedComments;
                
                if (contentType === 'post') {
                    fetchedComments = await getCommentsByPost(contentId);
                } else if (contentType === 'reel') {
                    fetchedComments = await getCommentsByReel(contentId);
                }
                
                // Initialize comments with empty replies array
                const commentsWithReplies = fetchedComments?.map(comment => ({
                    ...comment,
                    replies: [],
                    repliesLoaded: false
                })) || [];
                
                setComments(commentsWithReplies);

                if (fetchedComments && fetchedComments.length > 0) {
                    const uniqueUserIds = [...new Set(fetchedComments.map(comment => comment.id_usuario))];
                    
                    // Fetch user profiles for each unique user ID
                    for (const userId of uniqueUserIds) {
                        await fetchUserById(userId);
                    }

                    for (const comment of commentsWithReplies) {
                        await fetchRepliesForComment(comment.id);
                    }
                }

                setError(null);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setError('No se pudieron cargar los comentarios');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUserById = async (userId) => {
            try {
                console.log("Fetching user profile for ID:", userId);
                const response = await getUserProfile(userId);
                console.log("Raw response:", response);
                
                if (response) {
                    console.log("User profile data:", response);
                    setComments(prevComments => {
                        console.log("Previous comments:", prevComments);
                        return prevComments.map(comment => {
                            if (comment.id_usuario === userId) {
                                console.log("Updating comment for user:", userId);
                                return {
                                    ...comment,
                                    nombre_usuario: response.nombre || response.username,
                                    avatar_usuario: response.avatar
                                };
                            }
                            return comment;
                        });
                    });
                } else {
                    console.log("No user data found in response");
                }
            } catch (error) {
                console.error(`Error fetching user profile for ID ${userId}:`, error);
                console.log("Error details:", error.response || error.message);
            }
        };

        const fetchRepliesForComment = async (commentId) => {
            try {
                let replies = [];
                if (contentType === 'post') {
                    replies = await getCommentRepliesByPost(commentId);
                } else if (contentType === 'reel') {
                    replies = await getCommentRepliesByReel(commentId);
                }
                
                if (replies && replies.length > 0) {
                    // Fetch user profiles for replies
                    const uniqueUserIds = [...new Set(replies.map(reply => reply.id_usuario))];
                    
                    for (const replyUserId of uniqueUserIds) {
                        try {
                            const userProfile = await getUserProfile(replyUserId);
                            
                            if (userProfile) {
                                // Update user info in replies
                                replies = replies.map(reply => {
                                    if (reply.id_usuario === replyUserId) {
                                        return {
                                            ...reply,
                                            nombre_usuario: userProfile.nombre || userProfile.username,
                                            avatar_usuario: userProfile.avatar
                                        };
                                    }
                                    return reply;
                                });
                            }
                        } catch (error) {
                            console.error(`Error fetching user profile for reply user ID ${replyUserId}:`, error);
                        }
                    }
                    
                    // Update the comment with replies
                    setComments(prevComments => {
                        return prevComments.map(comment => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    replies: replies,
                                    repliesLoaded: true
                                };
                            }
                            return comment;
                        });
                    });
                    
                    // Add to expanded comments if there are replies
                    if (replies.length > 0) {
                        setExpandedComments(prev => {
                            if (!prev.includes(commentId)) {
                                return [...prev, commentId];
                            }
                            return prev;
                        });
                    }
                }
            } catch (error) {
                console.error(`Error fetching replies for comment ${commentId}:`, error);
            }
        };

        fetchComments();
    }, [contentId, contentType]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;
    
        try {
            setIsSubmitting(true);
            
            const commentData = {
                idUsuario: parseInt(userId),
                contenido: newComment.trim()
            };
            
            let createdComment;
            
            if (contentType === 'post') {
                commentData.idPost = contentId;
                createdComment = await createCommentPost(commentData);
            } else if (contentType === 'reel') {
                commentData.idReel = contentId;
                createdComment = await createCommentReel(commentData);
            }
            
            // Add the new comment to the list
            if (createdComment) {
                try {
                    const userProfile = await getUserProfile(userId);
                    console.log("Current user profile:", userProfile);
                    
                    const formattedComment = {
                        ...createdComment,
                        id_usuario: parseInt(userId),
                        nombre_usuario: userProfile.nombre || userProfile.username || 'Usuario',
                        avatar_usuario: userProfile.avatar,
                        contenido: newComment.trim(),
                        fecha_creacion: new Date().toISOString(),
                        replies: [],
                        repliesLoaded: false
                    };
            
                    setComments(prevComments => {
                        const updatedComments = [formattedComment, ...prevComments];
                        console.log("Updated comments list:", updatedComments);
                        return updatedComments;
                    });
                    setNewComment('');
                } catch (profileError) {
                    console.error("Error fetching user profile for new comment:", profileError);
                    // Still add comment even if profile fetch fails
                    const formattedComment = {
                        ...createdComment,
                        id_usuario: parseInt(userId),
                        nombre_usuario: 'Usuario',
                        fecha_creacion: new Date().toISOString(),
                        replies: [],
                        repliesLoaded: false
                    };
                    setComments(prevComments => [formattedComment, ...prevComments]);
                    setNewComment('');
                }
            }
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoadReplies = async (commentId) => {
        try {
            // Find the comment in the state
            const commentIndex = comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return;
            
            const comment = comments[commentIndex];
            
            // If replies are already loaded, just toggle the expanded state
            if (comment.repliesLoaded) {
                toggleExpandComment(commentId);
                return;
            }
            
            // Fetch replies based on content type
            let replies = [];
            if (contentType === 'post') {
                replies = await getCommentRepliesByPost(commentId);
            } else if (contentType === 'reel') {
                replies = await getCommentRepliesByReel(commentId);
            }
            
            // Update the comment with replies
            const updatedComments = [...comments];
            updatedComments[commentIndex] = {
                ...comment,
                replies: replies || [],
                repliesLoaded: true
            };
            
            // Fetch user profiles for replies
            if (replies && replies.length > 0) {
                const uniqueUserIds = [...new Set(replies.map(reply => reply.id_usuario))];
                
                for (const replyUserId of uniqueUserIds) {
                    try {
                        const userProfile = await getUserProfile(replyUserId);
                        
                        if (userProfile) {
                            // Update user info in replies
                            updatedComments[commentIndex].replies = updatedComments[commentIndex].replies.map(reply => {
                                if (reply.id_usuario === replyUserId) {
                                    return {
                                        ...reply,
                                        nombre_usuario: userProfile.nombre || userProfile.username,
                                        avatar_usuario: userProfile.avatar
                                    };
                                }
                                return reply;
                            });
                        }
                    } catch (error) {
                        console.error(`Error fetching user profile for reply user ID ${replyUserId}:`, error);
                    }
                }
            }
            
            setComments(updatedComments);
            toggleExpandComment(commentId);
            
        } catch (error) {
            console.error('Error loading replies:', error);
        }
    };

    const toggleExpandComment = (commentId) => {
        setExpandedComments(prev => {
            if (prev.includes(commentId)) {
                return prev.filter(id => id !== commentId);
            } else {
                return [...prev, commentId];
            }
        });
    };

    const handleReplyClick = (commentId) => {
        setReplyingTo(replyingTo === commentId ? null : commentId);
        setReplyContent('');
    };

    const handleSubmitReply = async (commentId) => {
        if (!replyContent.trim() || isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            const replyData = {
                idUsuario: parseInt(userId),
                idComentario: commentId,
                contenido: replyContent.trim()
            };
            
            let createdReply;
            
            if (contentType === 'post') {
                createdReply = await createCommentReplyPost(replyData);
            } else if (contentType === 'reel') {
                createdReply = await createCommentReplyReel(replyData);
            }
            
            if (createdReply) {
                try {
                    const userProfile = await getUserProfile(userId);
                    
                    const formattedReply = {
                        ...createdReply,
                        id_usuario: parseInt(userId),
                        nombre_usuario: userProfile.nombre || userProfile.username || 'Usuario',
                        avatar_usuario: userProfile.avatar,
                        contenido: replyContent.trim(),
                        fecha_creacion: new Date().toISOString()
                    };
                    
                    // Update the comment with the new reply
                    setComments(prevComments => {
                        return prevComments.map(comment => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    replies: [formattedReply, ...(comment.replies || [])],
                                    repliesLoaded: true
                                };
                            }
                            return comment;
                        });
                    });
                    
                    // Add this comment to expanded comments if not already there
                    if (!expandedComments.includes(commentId)) {
                        setExpandedComments(prev => [...prev, commentId]);
                    }
                    
                    setReplyContent('');
                    setReplyingTo(null);
                } catch (profileError) {
                    console.error("Error fetching user profile for reply:", profileError);
                    
                    const formattedReply = {
                        ...createdReply,
                        id_usuario: parseInt(userId),
                        nombre_usuario: 'Usuario',
                        contenido: replyContent.trim(),
                        fecha_creacion: new Date().toISOString()
                    };
                    
                    setComments(prevComments => {
                        return prevComments.map(comment => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    replies: [formattedReply, ...(comment.replies || [])],
                                    repliesLoaded: true
                                };
                            }
                            return comment;
                        });
                    });
                    
                    setReplyContent('');
                    setReplyingTo(null);
                }
            }
        } catch (error) {
            console.error('Error creating reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`sidebar-comments-wrapper ${isSidebarVisible ? "open" : "closed"}`}>
            <button className="button-close-comments" onClick={() => {
                setIsSidebarVisible(false);
                if (onClose) setTimeout(onClose, 400); // Allow animation to complete
            }}>
                <IoIosArrowForward />
            </button>
            <div className="sidebar-comments">
                <div className="comments-container">
                    <div className="comments-header">
                        <h2 className="comments-title">Comentarios</h2>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-600">
                            <p>Cargando comentarios...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-gray-600">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="comments-list">
                                {comments.length === 0 ? (
                                    <div className="p-4 text-center text-gray-600">
                                        <p>No hay comentarios aún</p>
                                        <p className="mt-2 text-sm">¡Sé el primero en comentar!</p>
                                    </div>
                                ) : (
                                    comments.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                                        .map((comment) => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-avatar">
                                                <img 
                                                    src={comment.avatar_usuario 
                                                        ? `http://localhost:3009${comment.avatar_usuario}` 
                                                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s"} 
                                                    alt="Avatar de usuario" 
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
                                                    }}
                                                />
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-author">{comment.nombre_usuario || 'Usuario'}</div>
                                                <div className="comment-text">{comment.contenido}</div>
                                                <div className="comment-date">
                                                    {comment.fecha_creacion ? new Date(comment.fecha_creacion).toLocaleString('es-ES') : ''}
                                                </div>
                                                <div className="comment-actions">
                                                    <button 
                                                        className="reply-button"
                                                        onClick={() => handleReplyClick(comment.id)}
                                                    >
                                                        <FaReply /> Responder
                                                    </button>
                                                    <button 
                                                        className="report-button "
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedComment(comment);
                                                            setShowReportModal(true);
                                                        }}
                                                    >
                                                        <FiFlag /> Reportar
                                                    </button>
                                                    {showReportModal && selectedComment && (
                                                        <ModalReport
                                                            isOpen={showReportModal}
                                                            onClose={() => {
                                                                setShowReportModal(false);
                                                                setSelectedComment(null);
                                                            }}
                                                            contentId={selectedComment.id}
                                                            contentType="comentario"
                                                            reportedUserId={selectedComment.id_usuario}
                                                        />
                                                    )}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <button 
                                                            className="view-replies-button"
                                                            onClick={() => handleLoadReplies(comment.id)}
                                                        >
                                                            {expandedComments.includes(comment.id) 
                                                                ? `Ocultar respuestas (${comment.replies.length})` 
                                                                : `Ver respuestas (${comment.replies.length})`}
                                                        </button>
                                                    )}
                                                    {comment.repliesLoaded && comment.replies.length === 0 && (
                                                        <button 
                                                            className="view-replies-button"
                                                            onClick={() => handleLoadReplies(comment.id)}
                                                        >
                                                            Cargar respuestas
                                                        </button>
                                                        
                                                    )}
                                                </div>
                                                
                                                {replyingTo === comment.id && (
                                                    <div className="reply-form">
                                                        <textarea
                                                            className="reply-input"
                                                            placeholder="Escribe una respuesta..."
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            rows={2}
                                                        />
                                                        <div className="reply-form-actions">
                                                            <button 
                                                                className="cancel-reply-btn"
                                                                onClick={() => setReplyingTo(null)}
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button 
                                                                className="submit-reply-btn"
                                                                onClick={() => handleSubmitReply(comment.id)}
                                                                disabled={isSubmitting || !replyContent.trim()}
                                                            >
                                                                {isSubmitting ? 'Enviando...' : 'Responder'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {expandedComments.includes(comment.id) && comment.replies && (
                                                    <div className="replies-container">
                                                        {(comment.replies.slice(0, expandedComments.includes(comment.id) ? comment.replies.length : 1)).map(reply => (
                                                            <div key={reply.id} className="reply-item">
                                                                <div className="reply-avatar">
                                                                    <img 
                                                                        src={reply.avatar_usuario 
                                                                            ? `http://localhost:3009${reply.avatar_usuario}` 
                                                                            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s"} 
                                                                        alt="Avatar de usuario" 
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="reply-content">
                                                                    <div className="reply-author">{reply.nombre_usuario || 'Usuario'}</div>
                                                                    <div className="reply-text">{reply.contenido}</div>
                                                                    <div className="reply-date">
                                                                        {reply.fecha_creacion ? new Date(reply.fecha_creacion).toLocaleString('es-ES') : ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {comment.replies.length > 1 && !expandedComments.includes(comment.id) && (
                                                            <button 
                                                                className="view-replies-button"
                                                                onClick={() => toggleExpandComment(comment.id)}
                                                            >
                                                                Ver {comment.replies.length - 1} respuestas más
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form onSubmit={handleSubmitComment} className="comment-form">
                                <textarea
                                    className="comment-input"
                                    placeholder="Escribe un comentario..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={2}
                                />
                                <button 
                                    type="submit" 
                                    className="comment-submit-btn"
                                    disabled={isSubmitting || !newComment.trim()}
                                >
                                    {isSubmitting ? 'Enviando...' : 'Comentar'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidebarComments;