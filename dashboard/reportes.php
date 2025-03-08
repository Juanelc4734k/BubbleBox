<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Check if user is authenticated
if (!isset($_SESSION['admin_token'])) {
    header('Location: http://localhost:5173/login');
    exit();
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

$currentPage = 'reportes';

// Process report actions if submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $reportId = isset($_POST['report_id']) ? intval($_POST['report_id']) : 0;
    $action = $_POST['action'];
    $response = '';

    if ($reportId > 0) {
        switch ($action) {
            case 'resolve':
                $accion = isset($_POST['accion_tomada']) ? $_POST['accion_tomada'] : '';
                $response = callAPI('PUT', REPORTS_API . '/resolver/' . $reportId, [
                    'id_admin' => $userId,
                    'estado' => 'resuelto',
                    'accion_tomada' => $accion
                ]);
                break;

            case 'reject':
                $response = callAPI('PUT', REPORTS_API . '/resolver/' . $reportId, [
                    'id_admin' => $userId,
                    'estado' => 'rechazado',
                    'accion_tomada' => 'Reporte rechazado'
                ]);
                break;

            case 'review':
                $response = callAPI('PUT', REPORTS_API . '/resolver/' . $reportId, [
                    'id_admin' => $userId,
                    'estado' => 'revisado',
                    'accion_tomada' => 'En revisión'
                ]);
                break;
        }

        // Redirect to avoid form resubmission
        header('Location: reportes.php?status=' . ($response ? 'success' : 'error'));
        exit();
    }
}

// Get filter parameters
$filterType = isset($_GET['tipo']) ? $_GET['tipo'] : '';
$filterStatus = isset($_GET['estado']) ? $_GET['estado'] : '';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

// Build API query with filters
$apiQuery = REPORTS_API . '/obtener?limit=' . $limit . '&offset=' . $offset;
if (!empty($filterType)) {
    $apiQuery .= '&tipo=' . urlencode($filterType);
}
if (!empty($filterStatus)) {
    $apiQuery .= '&estado=' . urlencode($filterStatus);
}

// Get reports data
$reports = callAPI('GET', $apiQuery, null);
$totalReports = callAPI('GET', REPORTS_API . '/count', null);
$totalCount = isset($totalReports['count']) ? intval($totalReports['count']) : 0;
$totalPages = ceil($totalCount / $limit);

// Get statistics
$reportStats = callAPI('GET', REPORTS_API . '/stats', null);
$pendingCount = isset($reportStats['pending']) ? $reportStats['pending'] : 0;
$resolvedCount = isset($reportStats['resolved']) ? $reportStats['resolved'] : 0;
$rejectedCount = isset($reportStats['rejected']) ? $reportStats['rejected'] : 0;
$reviewCount = isset($reportStats['review']) ? $reportStats['review'] : 0;

include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">

    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <!-- Statistics Cards -->
        <div class="row">
            <!-- Pending Reports Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Reportes Pendientes</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($pendingCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-warning text-sm font-weight-bolder">
                                            Requieren atención
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-warning shadow-warning text-center rounded-circle">
                                    <i class="ni ni-bell-55 text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- In Review Reports Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">En Revisión</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($reviewCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-info text-sm font-weight-bolder">
                                            Siendo analizados
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-info shadow-info text-center rounded-circle">
                                    <i class="ni ni-glasses-2 text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resolved Reports Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Resueltos</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($resolvedCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-success text-sm font-weight-bolder">
                                            Acción tomada
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-success shadow-success text-center rounded-circle">
                                    <i class="ni ni-check-bold text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rejected Reports Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Rechazados</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($rejectedCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-danger text-sm font-weight-bolder">
                                            Sin acción requerida
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-danger shadow-danger text-center rounded-circle">
                                    <i class="ni ni-fat-remove text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0">
                        <h6>Filtrar Reportes</h6>
                    </div>
                    <div class="card-body px-4 pt-0 pb-2">
                        <form method="GET" action="reportes.php" class="row align-items-center">
                            <div class="col-md-4 mb-3">
                                <label for="tipo" class="form-control-label">Tipo de Reporte</label>
                                <select class="form-control" id="tipo" name="tipo">
                                    <option value="" <?php echo $filterType === '' ? 'selected' : ''; ?>>Todos</option>
                                    <option value="publicacion" <?php echo $filterType === 'publicacion' ? 'selected' : ''; ?>>Publicación</option>
                                    <option value="reel" <?php echo $filterType === 'reel' ? 'selected' : ''; ?>>Reel</option>
                                    <option value="comentario" <?php echo $filterType === 'comentario' ? 'selected' : ''; ?>>Comentario</option>
                                    <option value="comunidad" <?php echo $filterType === 'comunidad' ? 'selected' : ''; ?>>Comunidad</option>
                                    <option value="usuario" <?php echo $filterType === 'usuario' ? 'selected' : ''; ?>>Usuario</option>
                                    <option value="contenido" <?php echo $filterType === 'contenido' ? 'selected' : ''; ?>>Contenido</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="estado" class="form-control-label">Estado</label>
                                <select class="form-control" id="estado" name="estado">
                                    <option value="" <?php echo $filterStatus === '' ? 'selected' : ''; ?>>Todos</option>
                                    <option value="pendiente" <?php echo $filterStatus === 'pendiente' ? 'selected' : ''; ?>>Pendiente</option>
                                    <option value="revisado" <?php echo $filterStatus === 'revisado' ? 'selected' : ''; ?>>En Revisión</option>
                                    <option value="resuelto" <?php echo $filterStatus === 'resuelto' ? 'selected' : ''; ?>>Resuelto</option>
                                    <option value="rechazado" <?php echo $filterStatus === 'rechazado' ? 'selected' : ''; ?>>Rechazado</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3 d-flex align-items-end">
                                <button type="submit" class="btn btn-primary mb-0">Filtrar</button>
                                <a href="reportes.php" class="btn btn-outline-secondary mb-0 ms-2">Limpiar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reports Table -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0">
                        <h6>Listado de Reportes</h6>
                    </div>
                    <div class="card-body px-0 pt-0 pb-2">
                        <div class="table-responsive p-0">
                            <table class="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">ID</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tipo</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Motivo</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Reportado por</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Fecha</th>
                                        <th class="text-secondary opacity-7"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
                                    if ($reports && is_array($reports)) {
                                        foreach ($reports as $report) {
                                            // Get user details of reporter
                                            $userDetails = callAPI('GET', USERS_API . '/usuario/' . $report['id_usuario_reportante'], null);

                                            // Check if we got valid user data
                                            $username = 'Usuario Desconocido';
                                            $email = '';

                                            if (!empty($userDetails) && is_array($userDetails)) {
                                                // If the API returns an array with user object
                                                if (isset($userDetails[0])) {
                                                    $user = $userDetails[0];
                                                    $username = isset($user['username']) ? $user['username'] : (isset($user['nombre']) ? $user['nombre'] : 'Usuario Desconocido');
                                                    $email = isset($user['email']) ? $user['email'] : '';
                                                }
                                                // If the API returns the user object directly
                                                else if (isset($userDetails['username']) || isset($userDetails['nombre'])) {
                                                    $username = isset($userDetails['username']) ? $userDetails['username'] : (isset($userDetails['nombre']) ? $userDetails['nombre'] : 'Usuario Desconocido');
                                                    $email = isset($userDetails['email']) ? $userDetails['email'] : '';
                                                }
                                            }

                                            // Format date
                                            $date = new DateTime($report['fecha_reporte']);
                                            $date->setTimezone(new DateTimeZone('America/Bogota')); // Set to Colombia timezone
                                            $formattedDate = $date->format('Y-m-d H:i:s');

                                            // Determine badge color based on status
                                            $statusBadgeClass = 'bg-gradient-secondary';
                                            $statusText = 'Desconocido';

                                            switch ($report['estado']) {
                                                case 'pendiente':
                                                    $statusBadgeClass = 'bg-gradient-warning';
                                                    $statusText = 'Pendiente';
                                                    break;
                                                case 'revisado':
                                                    $statusBadgeClass = 'bg-gradient-info';
                                                    $statusText = 'En Revisión';
                                                    break;
                                                case 'resuelto':
                                                    $statusBadgeClass = 'bg-gradient-success';
                                                    $statusText = 'Resuelto';
                                                    break;
                                                case 'rechazado':
                                                    $statusBadgeClass = 'bg-gradient-danger';
                                                    $statusText = 'Rechazado';
                                                    break;
                                            }

                                            // Format report type
                                            $reportType = ucfirst($report['tipo_reporte']);
                                    ?>
                                            <tr>
                                                <td class="ps-4">
                                                    <p class="text-xs font-weight-bold mb-0"><?php echo $report['id']; ?></p>
                                                </td>
                                                <td>
                                                    <div class="d-flex px-2 py-1">
                                                        <div class="d-flex flex-column justify-content-center">
                                                            <h6 class="mb-0 text-sm"><?php echo htmlspecialchars($reportType); ?></h6>
                                                            <p class="text-xs text-secondary mb-0">ID: <?php echo htmlspecialchars($report['id_contenido']); ?></p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p class="text-xs font-weight-bold mb-0"><?php echo htmlspecialchars($report['motivo']); ?></p>
                                                </td>
                                                <td>
                                                    <p class="text-xs font-weight-bold mb-0"><?php echo htmlspecialchars($username); ?></p>
                                                    <p class="text-xs text-secondary mb-0"><?php echo htmlspecialchars($email); ?></p>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="badge badge-sm <?php echo $statusBadgeClass; ?>"><?php echo $statusText; ?></span>
                                                </td>
                                                <td class="align-middle text-center">
                                                    <span class="text-secondary text-xs font-weight-bold"><?php echo $formattedDate; ?></span>
                                                </td>
                                                <td class="align-middle">
                                                    <button type="button" class="btn btn-link text-secondary mb-0"
                                                        data-bs-toggle="modal" data-bs-target="#reportModal<?php echo $report['id']; ?>">
                                                        <i class="fa fa-ellipsis-v text-xs"></i>
                                                    </button>
                                                </td>
                                            </tr>

                                            <!-- Report Modal -->
                                            <div class="modal fade" id="reportModal<?php echo $report['id']; ?>" tabindex="-1" role="dialog" aria-labelledby="reportModalLabel<?php echo $report['id']; ?>" aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered" role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="reportModalLabel<?php echo $report['id']; ?>">
                                                                Detalles del Reporte #<?php echo $report['id']; ?>
                                                            </h5>
                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="row">
                                                                <div class="col-12">
                                                                    <h6 class="text-uppercase text-body text-xs font-weight-bolder">Información del Reporte</h6>
                                                                    <ul class="list-group">
                                                                        <li class="list-group-item border-0 ps-0 pt-0 text-sm">
                                                                            <strong class="text-dark">Tipo:</strong> &nbsp; <?php echo htmlspecialchars($reportType); ?>
                                                                        </li>
                                                                        <li class="list-group-item border-0 ps-0 text-sm">
                                                                            <strong class="text-dark">ID Contenido:</strong> &nbsp; <?php echo htmlspecialchars($report['id_contenido']); ?>
                                                                        </li>
                                                                        <li class="list-group-item border-0 ps-0 text-sm">
                                                                            <strong class="text-dark">Motivo:</strong> &nbsp; <?php echo htmlspecialchars($report['motivo']); ?>
                                                                        </li>
                                                                        <li class="list-group-item border-0 ps-0 text-sm">
                                                                            <strong class="text-dark">Descripción:</strong> &nbsp;
                                                                            <p class="text-sm mt-2"><?php echo nl2br(htmlspecialchars($report['descripcion'])); ?></p>
                                                                        </li>
                                                                        <li class="list-group-item border-0 ps-0 text-sm">
                                                                            <strong class="text-dark">Reportado por:</strong> &nbsp; <?php echo htmlspecialchars($username); ?>
                                                                        </li>
                                                                        <li class="list-group-item border-0 ps-0 text-sm">
                                                                            <strong class="text-dark">Fecha:</strong> &nbsp; <?php echo $formattedDate; ?>
                                                                        </li>
                                                                        <li class="list-group-item border-0 ps-0 text-sm">
                                                                            <strong class="text-dark">Estado:</strong> &nbsp;
                                                                            <span class="badge badge-sm <?php echo $statusBadgeClass; ?>"><?php echo $statusText; ?></span>
                                                                        </li>
                                                                        <?php if (!empty($report['accion_tomada'])): ?>
                                                                            <li class="list-group-item border-0 ps-0 text-sm">
                                                                                <strong class="text-dark">Acción tomada:</strong> &nbsp; <?php echo htmlspecialchars($report['accion_tomada']); ?>
                                                                            </li>
                                                                        <?php endif; ?>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <?php if ($report['estado'] === 'pendiente' || $report['estado'] === 'revisado'): ?>
                                                                <form method="POST" action="reportes.php" class="d-inline">
                                                                    <input type="hidden" name="report_id" value="<?php echo $report['id']; ?>">
                                                                    <input type="hidden" name="action" value="review">
                                                                    <button type="submit" class="btn btn-info">Marcar en Revisión</button>
                                                                </form>

                                                                <button type="button" class="btn btn-success" data-bs-toggle="modal"
                                                                    data-bs-target="#resolveModal<?php echo $report['id']; ?>"
                                                                    data-bs-dismiss="modal">
                                                                    Resolver
                                                                </button>

                                                                <form method="POST" action="reportes.php" class="d-inline">
                                                                    <input type="hidden" name="report_id" value="<?php echo $report['id']; ?>">
                                                                    <input type="hidden" name="action" value="reject">
                                                                    <button type="submit" class="btn btn-danger">Rechazar</button>
                                                                </form>
                                                            <?php else: ?>
                                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                                            <?php endif; ?>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Resolve Modal -->
                                            <div class="modal fade" id="resolveModal<?php echo $report['id']; ?>" tabindex="-1" role="dialog" aria-labelledby="resolveModalLabel<?php echo $report['id']; ?>" aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered" role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="resolveModalLabel<?php echo $report['id']; ?>">
                                                                Resolver Reporte #<?php echo $report['id']; ?>
                                                            </h5>
                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <form method="POST" action="reportes.php">
                                                            <div class="modal-body">
                                                                <div class="form-group">
                                                                    <label for="accion_tomada<?php echo $report['id']; ?>">Acción tomada</label>
                                                                    <textarea class="form-control" id="accion_tomada<?php echo $report['id']; ?>" name="accion_tomada" rows="4" required></textarea>
                                                                </div>
                                                                <input type="hidden" name="report_id" value="<?php echo $report['id']; ?>">
                                                                <input type="hidden" name="action" value="resolve">
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                                                <button type="submit" class="btn btn-success">Confirmar Resolución</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php
                                        }
                                    } else {
                                        ?>
                                        <tr>
                                            <td colspan="7" class="text-center">No hay reportes disponibles</td>
                                        </tr>
                                    <?php
                                    }
                                    ?>
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <?php if ($totalPages > 1): ?>
                            <div class="card-footer py-3">
                                <nav aria-label="Navegación de reportes">
                                    <ul class="pagination justify-content-center mb-0">
                                        <li class="page-item <?php echo ($page <= 1) ? 'disabled' : ''; ?>">
                                            <a class="page-link" href="?page=<?php echo $page - 1; ?>&tipo=<?php echo urlencode($filterType); ?>&estado=<?php echo urlencode($filterStatus); ?>" tabindex="-1">
                                                <i class="fa fa-angle-left"></i>
                                                <span class="sr-only">Anterior</span>
                                            </a>
                                        </li>

                                        <?php
                                        // Show limited page numbers with current page in the middle
                                        $startPage = max(1, $page - 2);
                                        $endPage = min($totalPages, $page + 2);

                                        // Always show first page
                                        if ($startPage > 1) {
                                            echo '<li class="page-item"><a class="page-link" href="?page=1&tipo=' . urlencode($filterType) . '&estado=' . urlencode($filterStatus) . '">1</a></li>';
                                            if ($startPage > 2) {
                                                echo '<li class="page-item disabled"><a class="page-link" href="#">...</a></li>';
                                            }
                                        }

                                        // Display page numbers
                                        for ($i = $startPage; $i <= $endPage; $i++) {
                                            echo '<li class="page-item ' . (($i == $page) ? 'active' : '') . '">
                                                <a class="page-link" href="?page=' . $i . '&tipo=' . urlencode($filterType) . '&estado=' . urlencode($filterStatus) . '">' . $i . '</a>
                                              </li>';
                                        }

                                        // Always show last page
                                        if ($endPage < $totalPages) {
                                            if ($endPage < $totalPages - 1) {
                                                echo '<li class="page-item disabled"><a class="page-link" href="#">...</a></li>';
                                            }
                                            echo '<li class="page-item"><a class="page-link" href="?page=' . $totalPages . '&tipo=' . urlencode($filterType) . '&estado=' . urlencode($filterStatus) . '">' . $totalPages . '</a></li>';
                                        }
                                        ?>

                                        <li class="page-item <?php echo ($page >= $totalPages) ? 'disabled' : ''; ?>">
                                            <a class="page-link" href="?page=<?php echo $page + 1; ?>&tipo=<?php echo urlencode($filterType); ?>&estado=<?php echo urlencode($filterStatus); ?>">
                                                <i class="fa fa-angle-right"></i>
                                                <span class="sr-only">Siguiente</span>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Message -->
        <?php if (isset($_GET['status'])): ?>
            <div class="position-fixed bottom-1 end-1 z-index-2">
                <div class="toast fade show p-2 bg-white" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header border-0">
                        <i class="ni <?php echo $_GET['status'] === 'success' ? 'ni-check-bold text-success' : 'ni-bell-55 text-danger'; ?> me-2"></i>
                        <span class="me-auto font-weight-bold"><?php echo $_GET['status'] === 'success' ? 'Éxito' : 'Error'; ?></span>
                        <small class="text-body">Ahora</small>
                        <i class="fas fa-times text-md ms-3 cursor-pointer" data-bs-dismiss="toast" aria-label="Close"></i>
                    </div>
                    <hr class="horizontal dark m-0">
                    <div class="toast-body">
                        <?php echo $_GET['status'] === 'success' ? 'La acción se ha completado correctamente.' : 'Ha ocurrido un error al procesar la acción.'; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <?php include 'views/templates/footer.php'; ?>
    </div>
</main>

<!-- Toast Script -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Auto hide toast after 5 seconds
        setTimeout(function() {
            var toastElement = document.querySelector('.toast');
            if (toastElement) {
                var toast = new bootstrap.Toast(toastElement);
                toast.hide();

                // Remove status parameter from URL
                var url = new URL(window.location.href);
                url.searchParams.delete('status');
                window.history.replaceState({}, document.title, url);
            }
        }, 5000);
    });
</script>

<?php include 'views/templates/scripts.php'; ?>

</body>

</html>