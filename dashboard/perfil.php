<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Check if user is authenticated
if (!isset($_SESSION['admin_token'])) {
    header('Location: http://localhost:5173/login');
    exit();
}

// Decode JWT token to get user info
try {
    $payload = json_decode(base64_decode(explode('.', $_SESSION['admin_token'])[1]), true);
} catch (Exception $e) {
    header('Location: http://localhost:5173/login');
    exit();
}

if (!isset($payload['rol']) || $payload['rol'] !== 'administrador') {
    header('Location: http://localhost:5173/login');
    exit();
}

// User is authenticated and is an admin
$userId = $payload['userId'];
$userRole = $payload['rol'];

$currentPage = 'Perfil';

// Get user profile data
$userProfile = callAPI('GET', USERS_API . '/perfil/' . $userId, null);

// Handle profile update
$updateMessage = '';
$updateSuccess = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_profile'])) {
    $updateData = [
        'nombre' => $_POST['nombre'] ?? $userProfile['nombre'],
        'username' => $_POST['username'] ?? $userProfile['username'],
        'email' => $_POST['email'] ?? $userProfile['email'],
        'descripcion_usuario' => $_POST['biografia'] ?? $userProfile['descripcion']
    ];
    
    $jsonData = json_encode($updateData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $headers = ['Content-Type: application/json'];
    $updateResponse = callAPI('PUT', 'http://127.0.0.1:3000/users/actualizar-usuario/' . $userId, $jsonData, $headers);
        
    // Handle avatar upload if a file was selected
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $curl = curl_init();
        
        // Create a CURLFile object
        $cfile = new CURLFile(
            $_FILES['avatar']['tmp_name'],
            $_FILES['avatar']['type'],
            $_FILES['avatar']['name']
        );
        
        // Setup the form data with 'avatar' as the key
        $formData = ['avatar' => $cfile];
        
        // Setup cURL options
        curl_setopt_array($curl, [
            CURLOPT_URL => 'http://127.0.0.1:3000/users/actualizar-foto-perfil',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $formData,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $_SESSION['admin_token']
            ],
        ]);
        
        $avatarResponse = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        $avatarResponseData = json_decode($avatarResponse, true);
        
        if ($httpCode === 200 && isset($avatarResponseData['success']) && $avatarResponseData['success']) {
            $updateSuccess = true;
            $updateMessage = 'Perfil y foto actualizados correctamente';
        } else {
            $updateMessage = 'Perfil actualizado, pero hubo un error al subir la imagen: ' . 
                            ($avatarResponseData['message'] ?? 'Error desconocido');
        }
    } else {
        if (isset($updateResponse['success']) && $updateResponse['success']) {
            $updateSuccess = true;
            $updateMessage = 'Perfil actualizado correctamente';
        } else {
            $updateMessage = 'Error al actualizar el perfil: ' . ($updateResponse['message'] ?? 'Error desconocido');
        }
    }
    
    // Refresh user profile data
    $userProfile = callAPI('GET', USERS_API . '/perfil/' . $userId, null);
}
$avatarMessage = '';
$avatarSuccess = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['upload_avatar'])) {
    // Avatar upload code remains unchanged
    // ... existing code ...
}

// Include header
include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">
    
    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header pb-0">
                        <div class="d-flex align-items-center">
                            <p class="mb-0">Información de Perfil</p>
                            <?php if ($updateMessage): ?>
                                <div class="ms-auto alert alert-<?php echo $updateSuccess ? 'success' : 'danger'; ?> alert-dismissible fade show py-2 px-3 mb-0">
                                    <?php echo $updateMessage; ?>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>
                            <?php endif; ?>
                            <button type="button" class="btn btn-primary btn-sm ms-auto" data-bs-toggle="modal" data-bs-target="#editProfileModal">
                                Editar Perfil
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-4 text-center mb-4 mb-md-0">
                                <div class="position-relative">
                                    <?php
                                    $avatarUrl = isset($userProfile['avatar']) && $userProfile['avatar']
                                        ? 'http://localhost:3009' . $userProfile['avatar']
                                        : 'public/assets/img/team-2.jpg';
                                    ?>
                                    <img src="<?php echo $avatarUrl; ?>" class="rounded-circle img-fluid border border-2 border-primary" style="width: 150px; height: 150px; object-fit: cover;">
                                
                                </div>
                                
                                <h5 class="mt-3"><?php echo htmlspecialchars($userProfile['nombre'] ?? 'Administrador'); ?></h5>
                                <div class="text-muted">
                                    <i class="ni location_pin mr-2"></i><?php echo htmlspecialchars($userProfile['username'] ?? '@admin'); ?>
                                </div>
                                <div class="badge bg-gradient-primary mt-2">
                                    <?php echo ucfirst($userRole); ?>
                                </div>
                            </div>
                            
                            <div class="col-md-8">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label text-muted">Nombre</label>
                                            <p class="form-control-static fw-bold"><?php echo htmlspecialchars($userProfile['nombre'] ?? ''); ?></p>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label text-muted">Username</label>
                                            <p class="form-control-static fw-bold"><?php echo htmlspecialchars($userProfile['username'] ?? ''); ?></p>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label class="form-control-label text-muted">Email</label>
                                            <p class="form-control-static fw-bold"><?php echo htmlspecialchars($userProfile['email'] ?? ''); ?></p>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-group">perfil                                             <label class="form-control-label text-muted">Biografía</label>
                                            <p class="form-control-static"><?php echo htmlspecialchars($userProfile['descripcion'] ?? 'Soy Administrador, un desarrollador apasionado por la programación y la ciberseguridad. Mi objetivo es convertirme en uno de los mejores programadores y hackers de sombrero blanco. Trabajo en proyectos backend y desarrollo aplicaciones seguras y eficientes.'); ?></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <hr class="horizontal dark my-4">
                        
                        <div class="row">
                            <div class="col-12">
                                <h6 class="text-uppercase text-body text-xs font-weight-bolder mb-3">Gustos:</h6>
                                <div>
                                    <span class="badge bg-gradient-primary me-2 mb-2 py-2 px-3">Programación y desarrollo de software</span>
                                    <span class="badge bg-gradient-info me-2 mb-2 py-2 px-3">Hacking ético y ciberseguridad</span>
                                    <span class="badge bg-gradient-secondary me-2 mb-2 py-2 px-3">Lenguajes de programación</span>
                                    <span class="badge bg-gradient-success me-2 mb-2 py-2 px-3">Desarrollar aplicaciones</span>
                                </div>
                            </div>
                        </div>
                        
                        <hr class="horizontal dark my-4">
                        
                        <div class="row">
                            <div class="col-12">
                                <h6 class="text-uppercase text-body text-xs font-weight-bolder mb-3">Información general:</h6>
                                <ul class="list-group">
                                    <li class="list-group-item border-0 ps-0 pt-0 text-sm">
                                        <strong class="text-dark me-2"><i class="fas fa-envelope me-2 text-primary"></i>Email:</strong>
                                        <?php echo htmlspecialchars($userProfile['email'] ?? 'administrador@gmail.com'); ?>
                                    </li>
                                    <li class="list-group-item border-0 ps-0 text-sm">
                                        <strong class="text-dark me-2"><i class="fas fa-phone me-2 text-success"></i>Teléfono:</strong>
                                        <?php echo htmlspecialchars($userProfile['telefono'] ?? '3182672892'); ?>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <?php if ($avatarMessage): ?>
                            <div class="alert alert-<?php echo $avatarSuccess ? 'success' : 'danger'; ?> alert-dismissible fade show mt-3 py-2 px-3">
                                <?php echo $avatarMessage; ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        
        </div>
    </div>
    
    <!-- Edit Profile Modal -->
    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editProfileModalLabel">Editar Perfil</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="POST" action="" enctype="multipart/form-data">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12 text-center mb-4">
                                <div class="position-relative d-inline-block">
                                    <img src="<?php echo $avatarUrl; ?>" class="rounded-circle img-fluid border border-2 border-primary" style="width: 120px; height: 120px; object-fit: cover;">
                                    <label for="avatar" class="btn btn-sm btn-info position-absolute bottom-0 end-0" style="cursor: pointer;">
                                        <i class="fas fa-camera"></i>
                                    </label>
                                    <input type="file" id="avatar" name="avatar" class="d-none" accept="image/*">
                                </div>
                                <div class="small text-muted mt-2">Haz clic en el ícono de cámara para cambiar tu foto</div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nombre" class="form-control-label">Nombre</label>
                                    <input class="form-control" type="text" id="nombre" name="nombre" value="<?php echo htmlspecialchars($userProfile['nombre'] ?? ''); ?>">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="username" class="form-control-label">Username</label>
                                    <input class="form-control" type="text" id="username" name="username" value="<?php echo htmlspecialchars($userProfile['username'] ?? ''); ?>">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="email" class="form-control-label">Email</label>
                                    <input class="form-control" type="email" id="email" name="email" value="<?php echo htmlspecialchars($userProfile['email'] ?? ''); ?>">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="biografia" class="form-control-label">Biografía</label>
                                    <textarea class="form-control" id="biografia" name="biografia" rows="3"><?php echo htmlspecialchars($userProfile['biografia'] ?? ''); ?></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" name="update_profile" class="btn btn-primary">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</main>
<?php include 'views/templates/footer.php'; ?>