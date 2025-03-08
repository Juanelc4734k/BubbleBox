<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Check if user is authenticated
if (!isset($_SESSION['admin_token'])) {
    header('Location: http://localhost:5173/login');
    exit();
}

if (!isset($_SESSION['user_name']) && isset($_SESSION['user_id'])) {
    getUserDetails();
}

// Get token data
$token_parts = explode('.', $_SESSION['admin_token']);
$payload = json_decode(base64_decode($token_parts[1]), true);

// Verify admin role
if (!isset($payload['rol']) || $payload['rol'] !== 'administrador') {
    header('Location: http://localhost:5173/login');
    exit();
}

// User is authenticated and is an admin
$userId = $payload['userId'];
$userRole = $payload['rol'];

// Check if community ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: index.php');
    exit();
}

$communityId = intval($_GET['id']);
$currentPage = 'Detalle de Comunidad';

// Get community details
$community = callAPI('GET', COMMUNITIES_API . '/obtener/' . $communityId, null);

// If community not found, redirect to index
if (!$community || isset($community['error'])) {
    header('Location: index.php?error=community_not_found');
    exit();
}

// Get creator details
$creator = null;
if (isset($community['id_creador'])) {
    $creator = callAPI('GET', USERS_API . '/usuario/' . $community['id_creador'], null);
}

// Get community members
$members = callAPI('GET', COMMUNITIES_API . '/obtener-miembros/' . $communityId, null);
// Check if members data is valid - the API returns an array of members directly
if (!is_array($members)) {
    $members = [];
}

// Get community posts
$posts = callAPI('GET', POSTS_API . '/comunidad/' . $communityId, null);
if (isset($posts['error']) || !is_array($posts)) {
    $posts = [];
}

// Include header
include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">

    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
                        <h6>Detalle de Comunidad #<?php echo $communityId; ?></h6>
                        <a href="communities.php" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-arrow-left me-1"></i>Volver
                        </a>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Información de la Comunidad</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="text-center mb-4">
                                            <?php
                                            $bannerUrl = isset($community['imagen']) && $community['imagen']
                                                ? 'http://localhost:3004/uploads/' . $community['imagen']
                                                : './public/assets/img/icons/community-banner-placeholder.jpg';
                                            ?>
                                            <div class="position-relative mb-3">
                                                <img src="<?php echo $bannerUrl; ?>" class="img-fluid rounded shadow-sm" alt="Community banner" style="max-height: 150px; width: 100%; object-fit: cover;">

                                                <?php
                                                $avatarUrl = isset($community['imagen']) && $community['imagen']
                                                    ? 'http://localhost:3004/uploads/' . $community['imagen']
                                                    : './public/assets/img/icons/community-banner-placeholder.jpg';
                                                ?>
                                                <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-xxl rounded-circle shadow border border-white position-absolute"
                                                    style="bottom: -30px; left: 50%; transform: translateX(-50%);" alt="Community avatar">
                                            </div>

                                            <h4 class="mt-4 mb-0"><?php echo htmlspecialchars($community['nombre'] ?? 'Sin nombre'); ?></h4>
                                            <p class="text-sm text-muted">Creada el <?php echo isset($community['fecha_creacion']) ? date('d/m/Y', strtotime($community['fecha_creacion'])) : 'fecha desconocida'; ?></p>
                                        </div>

                                        <div class="mb-3">
                                            <h6 class="text-sm">Descripción:</h6>
                                            <p class="text-sm mb-2" style="white-space: pre-wrap;"><?php echo isset($community['descripcion']) ? htmlspecialchars($community['descripcion']) : 'Sin descripción'; ?></p>
                                        </div>

                                        <div class="mb-3">
                                            <h6 class="text-sm">Estadísticas:</h6>
                                            <div class="row">
                                                <div class="col-4">
                                                    <div class="card bg-gradient-primary shadow-sm">
                                                        <div class="card-body p-3 text-center">
                                                            <h5 class="text-white mb-0"><?php echo count($members); ?></h5>
                                                            <p class="text-xs text-white mb-0">Miembros</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-4">
                                                    <div class="card bg-gradient-info shadow-sm">
                                                        <div class="card-body p-3 text-center">
                                                            <h5 class="text-white mb-0"><?php echo count($posts); ?></h5>
                                                            <p class="text-xs text-white mb-0">Publicaciones</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-4">
                                                    <div class="card bg-gradient-success shadow-sm">
                                                        <div class="card-body p-3 text-center">
                                                            <h5 class="text-white mb-0"><?php echo isset($community['visitas']) ? number_format($community['visitas']) : '0'; ?></h5>
                                                            <p class="text-xs text-white mb-0">Visitas</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Creador de la Comunidad</h6>
                                    </div>
                                    <div class="card-body">
                                        <?php if ($creator): ?>
                                            <div class="d-flex align-items-center mb-3">
                                                <?php
                                                $creatorAvatarUrl = isset($creator['avatar']) && $creator['avatar']
                                                    ? 'http://localhost:3009' . $creator['avatar']
                                                    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                                ?>
                                                <img src="<?php echo $creatorAvatarUrl; ?>" class="avatar avatar-md rounded-circle me-3" alt="creator avatar">
                                                <div>
                                                    <h6 class="mb-0"><?php echo htmlspecialchars($creator['username'] ?? 'Usuario Desconocido'); ?></h6>
                                                    <p class="text-xs text-muted mb-0">ID: <?php echo $community['id_creador']; ?></p>
                                                    <a href="user-detail.php?id=<?php echo $community['id_creador']; ?>" class="btn btn-link text-info p-0 mt-1">
                                                        <i class="fas fa-user me-1"></i>Ver Perfil
                                                    </a>
                                                </div>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-warning text-sm" role="alert">
                                                No se pudo obtener información del creador con ID: <?php echo $community['id_creador']; ?>
                                            </div>
                                        <?php endif; ?>

                                        <hr class="horizontal dark my-3">

                                        <div class="mb-3">
                                            <h6 class="text-sm mb-2">Reglas de la Comunidad:</h6>
                                            <?php if (isset($community['reglas']) && !empty($community['reglas'])): ?>
                                                <ul class="ps-4 mb-0">
                                                    <?php
                                                    $reglas = is_array($community['reglas']) ? $community['reglas'] : json_decode($community['reglas'], true);
                                                    if (is_array($reglas)):
                                                        foreach ($reglas as $regla):
                                                    ?>
                                                            <li class="text-sm mb-1"><?php echo htmlspecialchars($regla); ?></li>
                                                        <?php
                                                        endforeach;
                                                    else:
                                                        ?>
                                                        <li class="text-sm mb-1"><?php echo htmlspecialchars($community['reglas']); ?></li>
                                                    <?php endif; ?>
                                                </ul>
                                            <?php else: ?>
                                                <p class="text-sm text-muted mb-0">No hay reglas establecidas para esta comunidad.</p>
                                            <?php endif; ?>
                                        </div>

                                        <?php if (isset($community['categorias']) && !empty($community['categorias'])): ?>
                                            <div class="mb-3">
                                                <h6 class="text-sm mb-2">Categorías:</h6>
                                                <div>
                                                    <?php
                                                    $categorias = is_array($community['categorias']) ? $community['categorias'] : explode(',', $community['categorias']);
                                                    foreach ($categorias as $categoria):
                                                        $cat = trim($categoria);
                                                        if (!empty($cat)):
                                                    ?>
                                                            <span class="badge bg-gradient-info me-1 mb-1"><?php echo htmlspecialchars($cat); ?></span>
                                                    <?php
                                                        endif;
                                                    endforeach;
                                                    ?>
                                                </div>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">Miembros (<?php echo count($members); ?>)</h6>
                                        <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#membersList">
                                            <i class="fas fa-users me-1"></i>Ver Miembros
                                        </button>
                                    </div>
                                    <div class="card-body collapse" id="membersList">
                                        <?php if (count($members) > 0): ?>
                                            <div class="table-responsive">
                                                <table class="table align-items-center mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Rol</th>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha de Unión</th>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php foreach ($members as $member): ?>
                                                            <tr>
                                                                <td>
                                                                    <div class="d-flex px-2 py-1">
                                                                        <div>
                                                                            <?php
                                                                            $memberAvatarUrl = isset($member['avatar']) && $member['avatar']
                                                                                ? 'http://localhost:3009' . $member['avatar']
                                                                                : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                                                            ?>
                                                                            <img src="<?php echo $memberAvatarUrl; ?>" class="avatar avatar-sm me-3" alt="user avatar">
                                                                        </div>
                                                                        <div class="d-flex flex-column justify-content-center">
                                                                            <h6 class="mb-0 text-sm"><?php echo htmlspecialchars($member['username'] ?? 'Usuario ' . $member['id_usuario']); ?></h6>
                                                                            <p class="text-xs text-secondary mb-0">ID: <?php echo $member['id_usuario']; ?></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <?php
                                                                    $rolClass = 'bg-gradient-secondary';
                                                                    $rolText = 'Miembro';

                                                                    if (isset($member['rol'])) {
                                                                        if ($member['rol'] === 'moderador') {
                                                                            $rolClass = 'bg-gradient-warning';
                                                                            $rolText = 'Moderador';
                                                                        } elseif ($member['rol'] === 'admin' || $member['id_usuario'] == $community['id_creador']) {
                                                                            $rolClass = 'bg-gradient-danger';
                                                                            $rolText = 'Administrador';
                                                                        }
                                                                    }
                                                                    ?>
                                                                    <span class="badge <?php echo $rolClass; ?> text-xs"><?php echo $rolText; ?></span>
                                                                </td>
                                                                <td>
                                                                    <span class="text-secondary text-xs font-weight-bold">
                                                                        <?php echo isset($member['fecha_union']) ? date('d/m/Y', strtotime($member['fecha_union'])) : 'N/A'; ?>
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <a href="user-detail.php?id=<?php echo $member['id_usuario']; ?>" class="btn btn-link text-info p-0">
                                                                        <i class="fas fa-eye me-1"></i>Ver
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-info text-white text-sm" role="alert">
                                                No hay miembros registrados en esta comunidad.
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">Publicaciones (<?php echo count($posts); ?>)</h6>
                                        <button type="button" class="btn btn-sm btn-outline-info" data-bs-toggle="collapse" data-bs-target="#postsList">
                                            <i class="fas fa-list me-1"></i>Ver Publicaciones
                                        </button>
                                    </div>
                                    <div class="card-body collapse" id="postsList">
                                        <?php if (count($posts) > 0): ?>
                                            <div class="table-responsive">
                                                <table class="table align-items-center mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Título</th>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Autor</th>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php foreach ($posts as $post): ?>
                                                            <tr>
                                                                <td>
                                                                    <div class="d-flex px-2 py-1">
                                                                        <?php if (isset($post['imagen']) && $post['imagen']): ?>
                                                                            <div>
                                                                                <img src="<?php echo 'http://localhost:3009' . $post['imagen']; ?>" class="avatar avatar-sm me-3" alt="post image">
                                                                            </div>
                                                                        <?php endif; ?>
                                                                        <div class="d-flex flex-column justify-content-center">
                                                                            <h6 class="mb-0 text-sm"><?php echo htmlspecialchars(substr($post['titulo'], 0, 50)) . (strlen($post['titulo']) > 50 ? '...' : ''); ?></h6>
                                                                            <p class="text-xs text-secondary mb-0">ID: <?php echo $post['id']; ?></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <p class="text-xs font-weight-bold mb-0">ID: <?php echo $post['id_usuario']; ?></p>
                                                                </td>
                                                                <td>
                                                                    <span class="text-secondary text-xs font-weight-bold"><?php echo date('d/m/Y H:i', strtotime($post['fecha_creacion'])); ?></span>
                                                                </td>
                                                                <td>
                                                                    <a href="post-detail.php?id=<?php echo $post['id']; ?>" class="btn btn-link text-info p-0">
                                                                        <i class="fas fa-eye me-1"></i>Ver
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-info text-white text-sm" role="alert">
                                                No hay publicaciones en esta comunidad.
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Acciones</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-flex justify-content-start">
                                            <?php if (isset($community['tipo_privacidad']) && $community['tipo_privacidad'] === 'suspendido'): ?>
                                            <button type="button" class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#activateCommunityModal">
                                                <i class="fas fa-check-circle me-2"></i>Activar Comunidad
                                            </button>
                                            <?php else: ?>
                                            <button type="button" class="btn btn-warning me-2" data-bs-toggle="modal" data-bs-target="#suspendCommunityModal">
                                                <i class="fas fa-ban me-2"></i>Suspender Comunidad
                                            </button>
                                            <?php endif; ?>
                                            <button type="button" class="btn btn-danger me-2" data-bs-toggle="modal" data-bs-target="#deleteCommunityModal">
                                                <i class="fas fa-trash me-2"></i>Eliminar Comunidad
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Suspend Community Modal -->
<div class="modal fade" id="suspendCommunityModal" tabindex="-1" aria-labelledby="suspendCommunityModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="suspendCommunityModalLabel">Suspender Comunidad</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas suspender esta comunidad? Los miembros no podrán publicar nuevo contenido mientras esté suspendida.</p>
                <div class="mb-3">
                    <label for="suspensionReason" class="form-label">Motivo de la suspensión</label>
                    <textarea class="form-control" id="suspensionReason" rows="3" placeholder="Ingresa el motivo de la suspensión..."></textarea>
                </div>
                <div class="mb-3">
                    <label for="suspensionDuration" class="form-label">Duración (días)</label>
                    <input type="number" class="form-control" id="suspensionDuration" min="1" value="7">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-warning" id="confirmSuspendCommunity">Suspender</button>
            </div>
        </div>
    </div>
</div>

<!-- Activate Community Modal -->
<div class="modal fade" id="activateCommunityModal" tabindex="-1" aria-labelledby="activateCommunityModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="activateCommunityModalLabel">Activar Comunidad</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas activar esta comunidad? Los miembros podrán volver a publicar contenido.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="confirmActivateCommunity">Activar</button>
            </div>
        </div>
    </div>
</div>

<!-- Delete Community Modal -->
<div class="modal fade" id="deleteCommunityModal" tabindex="-1" aria-labelledby="deleteCommunityModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteCommunityModalLabel">Confirmar Eliminación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar esta comunidad? Esta acción no se puede deshacer.</p>
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Advertencia: Se eliminarán todas las publicaciones, comentarios y datos asociados a esta comunidad.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteCommunity">Eliminar</button>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Handle community suspension
        const confirmSuspendBtn = document.getElementById('confirmSuspendCommunity');

        const confirmActivateBtn = document.getElementById('confirmActivateCommunity');

        if (confirmActivateBtn) {
            confirmActivateBtn.addEventListener('click', function() {
                const communityId = <?php echo $communityId; ?>;
                
                fetch('<?php echo COMMUNITIES_API; ?>/activar/' + communityId, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estado: 'publica'
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al activar la comunidad');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Comunidad activada correctamente');
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al activar la comunidad. Por favor, inténtalo de nuevo.');
                });
            });
        }

        if (confirmSuspendBtn) {
            confirmSuspendBtn.addEventListener('click', function() {
                const communityId = <?php echo $communityId; ?>;
                const reason = document.getElementById('suspensionReason').value;
                const duration = document.getElementById('suspensionDuration').value;

                if (!reason.trim()) {
                    alert('Por favor, ingresa un motivo para la suspensión.');
                    return;
                }

                fetch('<?php echo COMMUNITIES_API; ?>/suspender/' + communityId, {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            estado: 'suspendido',
                            motivo: reason,
                            duracion: parseInt(duration)
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al suspender la comunidad');
                        }
                        return response.json();
                    })
                    .then(data => {
                        alert('Comunidad suspendida correctamente');
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error al suspender la comunidad. Por favor, inténtalo de nuevo.');
                    });
            });
        }

        // Handle community deletion
        const confirmDeleteBtn = document.getElementById('confirmDeleteCommunity');

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                const communityId = <?php echo $communityId; ?>;

                fetch('<?php echo COMMUNITIES_API; ?>/eliminar/' + communityId, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al eliminar la comunidad');
                        }
                        return response.json();
                    })
                    .then(data => {
                        alert('Comunidad eliminada correctamente');
                        window.location.href = 'communities.php';
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error al eliminar la comunidad. Por favor, inténtalo de nuevo.');
                    });
            });
        }
    });
</script>

<?php include 'views/templates/footer.php'; ?>