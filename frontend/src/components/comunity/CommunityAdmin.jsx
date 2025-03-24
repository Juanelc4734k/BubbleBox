import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCommunityById, getCommunityMembers, leaveCommunity } from '../../services/comunity';
import Swal from 'sweetalert2';
import { getUsers } from '../../services/users';
import '../../assets/css/comunity/communityAdmin.css';

const CommunityAdmin = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = parseInt(localStorage.getItem('userId'));
  const avatarPorDefecto = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const communityData = await getCommunityById(id);
        
        // Only allow access if current user is the creator
        if (communityData.id_creador !== currentUserId) {
          window.location.href = '/comunidades';
          return;
        }

        setCommunity(communityData);
        
        // Get members using getCommunityMembers instead of filtering users
        const membersData = await getCommunityMembers(id);
        setMembers(membersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUserId]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  const handleRemoveMember = async (memberId) => {
    try {
      await Swal.fire({
        title: '¿Estás seguro?',
        text: "El miembro será eliminado de la comunidad",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#7354bb',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await leaveCommunity(id, memberId);
          // Refresh members list
          const updatedMembers = await getCommunityMembers(id);
          setMembers(updatedMembers);
          
          Swal.fire({
            icon: 'success',
            title: 'Miembro eliminado',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    } catch (error) {
      console.error('Error removing member:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar al miembro',
      });
    }
  };

  return (
    <div className="community-admin-container">
      <h1>Administración de "{community?.nombre}"</h1>
      
      <section className="community-stats">
        <h2>Estadísticas de la Comunidad</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Miembros</h3>
            <p>{members.length}</p>
          </div>
          <div className="stat-card">
            <h3>Fecha de Creación</h3>
            <p>{new Date(community?.fecha_creacion).toLocaleDateString()}</p>
          </div>
          <div className="stat-card">
            <h3>Tipo</h3>
            <p>{community?.tipo_privacidad === 'publica' ? 'Pública' : 'Privada'}</p>
          </div>
        </div>
      </section>

      <section className="members-list-admin">
        <h2 className="members-title">Miembros de la Comunidad</h2>
        <div className="members-grid">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info-container">
                <img 
                  src={member.avatar
                    ? (member.avatar.startsWith('http') 
                        ? member.avatar 
                        : `http://localhost:3009${member.avatar}`)
                    : avatarPorDefecto} 
                  alt={member.nombre} 
                  className="member-avatar"
                />
                <div className="member-info">
                  <h3>{member.nombre}</h3>
                  <p className="username">
                    @{member.username}
                    {member.id === community.id_creador && (
                      <span className="creator-badge-admin">Creador</span>
                    )}
                  </p>
                </div>
              </div>
              {member.id !== community.id_creador && (
                <button 
                  className="remove-member-btn"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CommunityAdmin;