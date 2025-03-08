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

$currentPage = 'Recuperaciones';

// Fetch real backup data from API
$backups = [];
$backupStats = [];

// Initialize cURL session for backups list
$curl = curl_init(BACKUPS_API . '/list');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $_SESSION['admin_token'],
    'Content-Type: application/json'
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpCode === 200) {
    $backupData = json_decode($response, true);
    if (isset($backupData['success']) && $backupData['success'] && isset($backupData['backups'])) {
        $backups = $backupData['backups'];
    }
}

// Get backup statistics
$curl = curl_init(BACKUPS_API . '/stats');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $_SESSION['admin_token'],
    'Content-Type: application/json'
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpCode === 200) {
    $statsData = json_decode($response, true);
    if (isset($statsData['success']) && $statsData['success']) {
        $backupStats = $statsData;
    }
}

// System stats - could be replaced with real data from an API
$memoryUsed = 1200; // MB
$memoryTotal = 4000; // MB
$storageUsed = 300; // MB
$storageTotal = 1000; // MB
$securityIssues = 0;

// Include header
include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>


<main class="main-content position-relative border-radius-lg">
    
    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-7 mb-lg-0 mb-4">
                <div class="card z-index-2 h-100">
                    <div class="card-header pb-0 pt-3 bg-transparent">
                        <h6 class="text-capitalize">Resumen De Recuperaciones</h6>
                        <p class="text-sm mb-0">
                            <i class="fa fa-arrow-up text-success"></i>
                            <span class="font-weight-bold">
                                <?php 
                                    echo isset($backupStats['stats']['total_backups']) ? $backupStats['stats']['total_backups'] : 0;
                                ?> respaldos
                            </span> en total
                        </p>
                    </div>
                    <div class="card-body p-3">
                        <div class="chart">
                            <canvas id="chart-line-backups" class="chart-canvas" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card h-100">
                    <div class="card-header pb-0 p-3">
                        <h6 class="mb-0">Estadísticas de respaldos</h6>
                    </div>
                    <div class="card-body p-3">
                        <ul class="list-group">
                            <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                <div class="d-flex align-items-center">
                                    <div class="icon icon-shape icon-sm me-3 bg-gradient-primary shadow text-center">
                                        <i class="ni ni-calendar-grid-58 text-white opacity-10"></i>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <h6 class="mb-1 text-dark text-sm">Último respaldo</h6>
                                        <span class="text-xs">
                                            <?php echo isset($backupStats['stats']['last_backup_date']) ? $backupStats['stats']['last_backup_date'] : 'No hay respaldos'; ?>
                                        </span>
                                    </div>
                                </div>
                            </li>
                            <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                <div class="d-flex align-items-center">
                                    <div class="icon icon-shape icon-sm me-3 bg-gradient-success shadow text-center">
                                        <i class="ni ni-check-bold text-white opacity-10"></i>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <h6 class="mb-1 text-dark text-sm">Restauraciones totales</h6>
                                        <span class="text-xs">
                                            <?php echo isset($backupStats['stats']['total_restores']) ? $backupStats['stats']['total_restores'] : '0'; ?>
                                        </span>
                                    </div>
                                </div>
                            </li>
                            <li class="list-group-item border-0 d-flex justify-content-between ps-0 border-radius-lg">
                                <div class="d-flex align-items-center">
                                    <div class="icon icon-shape icon-sm me-3 bg-gradient-warning shadow text-center">
                                        <i class="ni ni-time-alarm text-white opacity-10"></i>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <h6 class="mb-1 text-dark text-sm">Última restauración</h6>
                                        <span class="text-xs">
                                            <?php echo isset($backupStats['stats']['last_restore_date']) ? $backupStats['stats']['last_restore_date'] : 'No hay restauraciones'; ?>
                                        </span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-lg-4 mb-lg-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0 p-3">
                        <h6 class="mb-0">Crear un respaldo</h6>
                    </div>
                    <div class="card-body p-3 text-center">
                        <div class="backup-icon mb-3">
                            <img src="./public/assets/img/database.png" alt="Backup Icon" style="width: 100px; height: auto;" onerror="this.src='./public/assets/img/icons/database.svg'">
                        </div>
                        <button id="createBackupBtn" class="btn btn-primary">Crear</button>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-8 mb-lg-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0 p-3">
                        <h6 class="mb-0">Últimos respaldos</h6>
                    </div>
                    <div class="card-body p-3">
                        <div class="table-responsive">
                            <table class="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nombre</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Tamaño</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Creado por</th>
                                        <th class="text-secondary opacity-7"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($backups)): ?>
                                    <tr>
                                        <td colspan="5" class="text-center">No hay respaldos disponibles</td>
                                    </tr>
                                    <?php else: ?>
                                        <?php foreach ($backups as $backup): ?>
                                        <tr>
                                            <td>
                                                <div class="d-flex px-2 py-1">
                                                    <div class="d-flex flex-column justify-content-center">
                                                        <h6 class="mb-0 text-sm"><?php echo htmlspecialchars($backup['filename']); ?></h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p class="text-xs font-weight-bold mb-0">
                                                    <?php 
                                                        $date = new DateTime($backup['created_at']);
                                                        echo $date->format('d/m/Y H:i');
                                                    ?>
                                                </p>
                                            </td>
                                            <td>
                                                <p class="text-xs font-weight-bold mb-0"><?php echo $backup['fileSize'] ?? 'N/A'; ?></p>
                                            </td>
                                            <td>
                                                <p class="text-xs font-weight-bold mb-0"><?php echo htmlspecialchars($backup['created_by_name'] ?? 'Sistema'); ?></p>
                                            </td>
                                            <td class="align-middle">
                                                <div class="dropdown position-static">
                                                    <button class="btn btn-link text-secondary mb-0" id="dropdownMenuButton<?php echo $backup['id']; ?>" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i class="fa fa-ellipsis-v text-xs"></i>
                                                    </button>
                                                    <ul class="dropdown-menu dropdown-menu-end shadow" style="z-index: 1050;" aria-labelledby="dropdownMenuButton<?php echo $backup['id']; ?>">
                                                        <li>
                                                            <a class="dropdown-item restore-backup" href="#" data-filename="<?php echo htmlspecialchars($backup['filename']); ?>">
                                                                Restaurar
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item" href="<?php echo BACKUPS_API; ?>/download/<?php echo urlencode($backup['filename']); ?>" target="_blank">
                                                                Descargar
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a class="dropdown-item delete-backup text-danger" href="#" data-filename="<?php echo htmlspecialchars($backup['filename']); ?>">
                                                                Eliminar
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Modal for backup creation -->
<div class="modal fade" id="createBackupModal" tabindex="-1" aria-labelledby="createBackupModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createBackupModalLabel">Crear Respaldo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="backupForm">
                    <div class="mb-3">
                        <label for="backupName" class="form-label">Nombre del respaldo</label>
                        <input type="text" class="form-control" id="backupName" placeholder="respaldo_<?php echo date('d_m_Y'); ?>">
                    </div>
                </form>
                <div class="progress d-none" id="backupProgress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
                </div>
                <div id="backupMessage" class="alert d-none mt-3"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="startBackupBtn">Iniciar Respaldo</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal for backup restoration (continued) -->
<div class="modal fade" id="restoreBackupModal" tabindex="-1" aria-labelledby="restoreBackupModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="restoreBackupModalLabel">Restaurar Respaldo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas restaurar el respaldo <strong id="restoreFilename"></strong>?</p>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" value="" id="confirmRestore">
                    <label class="form-check-label" for="confirmRestore">
                        Entiendo que esta acción reemplazará los datos actuales con los del respaldo seleccionado
                    </label>
                </div>
                <div class="progress d-none" id="restoreProgress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
                </div>
                <div id="restoreMessage" class="alert d-none mt-3"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="startRestoreBtn" disabled>Restaurar</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal for delete confirmation -->
<div class="modal fade" id="deleteBackupModal" tabindex="-1" aria-labelledby="deleteBackupModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteBackupModalLabel">Eliminar Respaldo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar el respaldo <strong id="deleteFilename"></strong>?</p>
                <p class="text-danger">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
            </div>
        </div>
    </div>
</div>

<?php include 'views/templates/footer.php';?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Chart initialization
    var ctx = document.getElementById("chart-line-backups").getContext("2d");
    
    var gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);
    gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
    gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
    gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');
    
    // Monthly backup data - replace with actual data from API
    const monthlyData = <?php echo isset($backupStats['monthlyStats']) ? json_encode($backupStats['monthlyStats']) : '[]'; ?>;
    
    const labels = monthlyData.length > 0 ? 
        monthlyData.map(item => item.month) : 
        ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const values = monthlyData.length > 0 ? 
        monthlyData.map(item => item.count) : 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Respaldos",
                tension: 0.4,
                borderWidth: 0,
                pointRadius: 0,
                borderColor: "#5e72e4",
                backgroundColor: gradientStroke1,
                borderWidth: 3,
                fill: true,
                data: values,
                maxBarThickness: 6
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                y: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5]
                    },
                    ticks: {
                        display: true,
                        padding: 10,
                        color: '#fbfbfb',
                        font: {
                            size: 11,
                            family: "Open Sans",
                            style: 'normal',
                            lineHeight: 2
                        },
                    }
                },
                x: {
                    grid: {
                        drawBorder: false,
                        display: false,
                        drawOnChartArea: false,
                        drawTicks: false,
                        borderDash: [5, 5]
                    },
                    ticks: {
                        display: true,
                        color: '#ccc',
                        padding: 20,
                        font: {
                            size: 11,
                            family: "Open Sans",
                            style: 'normal',
                            lineHeight: 2
                        },
                    }
                },
            },
        },
    });

    // Create backup modal
    const createBackupBtn = document.getElementById('createBackupBtn');
    const createBackupModal = new bootstrap.Modal(document.getElementById('createBackupModal'));
    const startBackupBtn = document.getElementById('startBackupBtn');
    const backupProgress = document.getElementById('backupProgress');
    const backupMessage = document.getElementById('backupMessage');

    createBackupBtn.addEventListener('click', function() {
        createBackupModal.show();
    });

    startBackupBtn.addEventListener('click', function() {
        const backupName = document.getElementById('backupName').value || 'backup';
        
        // Show progress bar
        backupProgress.classList.remove('d-none');
        backupProgress.querySelector('.progress-bar').style.width = '50%';
        startBackupBtn.disabled = true;
        
        // Make API request to create backup
        fetch('<?php echo BACKUPS_API; ?>/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <?php echo $_SESSION['admin_token']; ?>'
            },
            body: JSON.stringify({ name: backupName })
        })
        .then(response => response.json())
        .then(data => {
            backupProgress.querySelector('.progress-bar').style.width = '100%';
            
            if (data.success) {
                backupMessage.classList.remove('d-none', 'alert-danger');
                backupMessage.classList.add('alert-success');
                backupMessage.textContent = 'Respaldo creado exitosamente';
                
                // Reload page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                backupMessage.classList.remove('d-none', 'alert-success');
                backupMessage.classList.add('alert-danger');
                backupMessage.textContent = data.mensaje || 'Error al crear el respaldo';
                startBackupBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            backupProgress.querySelector('.progress-bar').style.width = '100%';
            backupMessage.classList.remove('d-none', 'alert-success');
            backupMessage.classList.add('alert-danger');
            backupMessage.textContent = 'Error de conexión';
            startBackupBtn.disabled = false;
        });
    });

    // Restore backup functionality
    const restoreLinks = document.querySelectorAll('.restore-backup');
    const restoreBackupModal = new bootstrap.Modal(document.getElementById('restoreBackupModal'));
    const startRestoreBtn = document.getElementById('startRestoreBtn');
    const confirmRestoreCheckbox = document.getElementById('confirmRestore');
    const restoreProgress = document.getElementById('restoreProgress');
    const restoreMessage = document.getElementById('restoreMessage');
    const restoreFilename = document.getElementById('restoreFilename');

    restoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = this.getAttribute('data-filename');
            restoreFilename.textContent = filename;
            restoreBackupModal.show();
        });
    });

    confirmRestoreCheckbox.addEventListener('change', function() {
        startRestoreBtn.disabled = !this.checked;
    });

    startRestoreBtn.addEventListener('click', function() {
        const filename = restoreFilename.textContent;
        
        // Show progress bar
        restoreProgress.classList.remove('d-none');
        restoreProgress.querySelector('.progress-bar').style.width = '50%';
        startRestoreBtn.disabled = true;
        
        // Make API request to restore backup
        fetch(`<?php echo BACKUPS_API; ?>/restore/${encodeURIComponent(filename)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <?php echo $_SESSION['admin_token']; ?>'
            }
        })
        .then(response => response.json())
        .then(data => {
            restoreProgress.querySelector('.progress-bar').style.width = '100%';
            
            if (data.success) {
                restoreMessage.classList.remove('d-none', 'alert-danger');
                restoreMessage.classList.add('alert-success');
                restoreMessage.textContent = 'Respaldo restaurado exitosamente';
                
                // Reload page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                restoreMessage.classList.remove('d-none', 'alert-success');
                restoreMessage.classList.add('alert-danger');
                restoreMessage.textContent = data.mensaje || 'Error al restaurar el respaldo';
                startRestoreBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            restoreProgress.querySelector('.progress-bar').style.width = '100%';
            restoreMessage.classList.remove('d-none', 'alert-success');
            restoreMessage.classList.add('alert-danger');
            restoreMessage.textContent = 'Error de conexión';
            startRestoreBtn.disabled = false;
        });
    });

    // Delete backup functionality
    const deleteLinks = document.querySelectorAll('.delete-backup');
    const deleteBackupModal = new bootstrap.Modal(document.getElementById('deleteBackupModal'));
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteFilename = document.getElementById('deleteFilename');

    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = this.getAttribute('data-filename');
            deleteFilename.textContent = filename;
            deleteBackupModal.show();
        });
    });

    confirmDeleteBtn.addEventListener('click', function() {
        const filename = deleteFilename.textContent;
        
        // Make API request to delete backup
        fetch(`<?php echo BACKUPS_API; ?>/delete/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <?php echo $_SESSION['admin_token']; ?>'
            }
        })
        .then(response => response.json())
        .then(data => {
            deleteBackupModal.hide();
            
            if (data.success) {
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Respaldo eliminado exitosamente',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.mensaje || 'Error al eliminar el respaldo',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            deleteBackupModal.hide();
            
            // Show error message
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión',
                confirmButtonText: 'Aceptar'
            });
        });
    });
});
</script>