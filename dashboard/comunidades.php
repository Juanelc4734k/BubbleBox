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

$currentPage = 'Comunidades';

// Get all communities
$communities = callAPI('GET', COMMUNITIES_API . '/obtener-todas', null);
if (!is_array($communities)) {
    $communities = [];
}

// Get community stats
$communityStats = callAPI('GET', STATS_API . '/communities/summary', null);
$totalCommunities = count($communities);
$activeCommunities = 0;
$suspendedCommunities = 0;

// Get recent communities (last 5)
$recentCommunities = array_slice(
    array_filter($communities, function($community) {
        return isset($community['fecha_creacion']);
    }),
    0, 5
);

// Sort recent communities by creation date (newest first)
usort($recentCommunities, function($a, $b) {
    return strtotime($b['fecha_creacion']) - strtotime($a['fecha_creacion']);
});

foreach ($communities as $community) {
    if (isset($community['tipo_privacidad'])) {
        if ($community['tipo_privacidad'] === 'suspendido') {
            $suspendedCommunities++;
        } else {
            $activeCommunities++;
        }
    } else {
        $activeCommunities++;
    }
}

// Include header
include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">
    
    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Total Comunidades</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo $totalCommunities; ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-success text-sm font-weight-bolder">
                                            <?php 
                                                // Get the last month's stats since communityStats is an array
                                                $lastMonthStats = end($communityStats);
                                                echo isset($lastMonthStats['growth_percentage']) ? '+' . number_format($lastMonthStats['growth_percentage'], 1) . '%' : '0.0%'; 
                                            ?>
                                        </span>
                                        desde el mes pasado
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-primary shadow-primary text-center rounded-circle">
                                    <i class="ni ni-world text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Comunidades Activas</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo $activeCommunities; ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-success text-sm font-weight-bolder">
                                            <?php echo $totalCommunities > 0 ? number_format(($activeCommunities / $totalCommunities) * 100, 1) . '%' : '0%'; ?>
                                        </span>
                                        del total
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

            <div class="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Comunidades Suspendidas</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo $suspendedCommunities; ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="text-danger text-sm font-weight-bolder">
                                            <?php echo $totalCommunities > 0 ? number_format(($suspendedCommunities / $totalCommunities) * 100, 1) . '%' : '0%'; ?>
                                        </span>
                                        del total
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-warning shadow-warning text-center rounded-circle">
                                    <i class="ni ni-fat-remove text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
                <div class="col-lg-7 mb-lg-0 mb-4">
                    <div class="card z-index-2 h-100">
                        <div class="card-header pb-0 pt-3 bg-transparent">
                            <h6 class="text-capitalize">Crecimiento de Comunidades</h6>
                            <p class="text-sm mb-0">
                                <i class="fa fa-arrow-up text-success"></i>
                                <span class="font-weight-bold">
                                    <?php echo isset($communityStats[0]['growth_percentage']) ? number_format($communityStats[0]['growth_percentage'], 1) . '%' : '0%'; ?>
                                </span> en <?php echo date('F'); ?>
                            </p>
                        </div>
                        <div class="card-body p-3">
                            <div class="chart">
                                <canvas id="chart-communities" class="chart-canvas" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="card">
                        <div class="card-header pb-0 p-3">
                            <h6 class="mb-0">Comunidades Recientes</h6>
                        </div>
                        <div class="card-body p-3">
                            <ul class="list-group">
                                <?php if (count($recentCommunities) > 0): ?>
                                    <?php foreach ($recentCommunities as $community): ?>
                                        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                            <div class="d-flex align-items-center">
                                                <?php
                                                $communityImageUrl = isset($community['avatar']) && $community['avatar']
                                                    ? 'http://localhost:3004/uploads/' . $community['avatar']
                                                    : './public/assets/img/icons/community-banner-placeholder.jpg';
                                                ?>
                                                <div class="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                                                    <img src="<?php echo $communityImageUrl; ?>" class="avatar avatar-sm rounded-circle me-2" alt="community image">
                                                </div>
                                                <div class="d-flex flex-column">
                                                    <h6 class="mb-1 text-dark text-sm"><?php echo htmlspecialchars($community['nombre'] ?? 'Sin nombre'); ?></h6>
                                                    <span class="text-xs">
                                                        Creada: <?php echo isset($community['fecha_creacion']) ? date('d M Y', strtotime($community['fecha_creacion'])) : 'N/A'; ?>
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="d-flex">
                                                <a href="community-detail.php?id=<?php echo $community['id']; ?>" class="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto">
                                                    <i class="ni ni-bold-right" aria-hidden="true"></i>
                                                </a>
                                            </div>
                                        </li>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                        <div class="d-flex align-items-center">
                                            <div class="d-flex flex-column">
                                                <h6 class="mb-1 text-dark text-sm">No hay comunidades recientes</h6>
                                            </div>
                                        </div>
                                    </li>
                                <?php endif; ?>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
                        <h6>Listado de Comunidades</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#filterOptions">
                                <i class="fas fa-filter me-1"></i>Filtros
                            </button>
                        </div>
                    </div>
                    
                    <div class="collapse" id="filterOptions">
                        <div class="card-body pt-0 pb-2">
                            <form id="filterForm" class="row g-3 align-items-center">
                                <div class="col-md-3">
                                    <label for="filterName" class="form-label">Nombre</label>
                                    <input type="text" class="form-control form-control-sm" id="filterName" placeholder="Buscar por nombre...">
                                </div>
                                <div class="col-md-3">
                                    <label for="filterStatus" class="form-label">Estado</label>
                                    <select class="form-select form-select-sm" id="filterStatus">
                                        <option value="">Todos</option>
                                        <option value="activo">Activo</option>
                                        <option value="suspendido">Suspendido</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="filterDate" class="form-label">Fecha de creación</label>
                                    <select class="form-select form-select-sm" id="filterDate">
                                        <option value="">Cualquier fecha</option>
                                        <option value="7">Últimos 7 días</option>
                                        <option value="30">Últimos 30 días</option>
                                        <option value="90">Últimos 3 meses</option>
                                    </select>
                                </div>
                                <div class="col-md-3 d-flex align-items-end">
                                    <button type="button" id="applyFilters" class="btn btn-primary btn-sm me-2">Aplicar</button>
                                    <button type="button" id="resetFilters" class="btn btn-outline-secondary btn-sm">Resetear</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card-body px-0 pt-0 pb-2">
                        <div class="table-responsive p-0">
                            <table class="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Comunidad</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Creador</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Miembros</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha Creación</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Estado</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (count($communities) > 0): ?>
                                        <?php foreach ($communities as $community): ?>
                                            <tr>
                                                <td>
                                                    <div class="d-flex px-2 py-1">
                                                        <div>
                                                            <?php
                                                            $communityImageUrl = isset($community['avatar']) && $community['avatar']
                                                                ? 'http://localhost:3004/uploads/' . $community['avatar']
                                                                : './public/assets/img/icons/community-banner-placeholder.jpg';
                                                            ?>
                                                            <img src="<?php echo $communityImageUrl; ?>" class="avatar avatar-sm me-3" alt="community image">
                                                        </div>
                                                        <div class="d-flex flex-column justify-content-center">
                                                            <h6 class="mb-0 text-sm"><?php echo htmlspecialchars($community['nombre'] ?? 'Sin nombre'); ?></h6>
                                                            <p class="text-xs text-secondary mb-0">ID: <?php echo $community['id']; ?></p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p class="text-xs font-weight-bold mb-0">ID: <?php echo $community['id_creador']; ?></p>
                                                </td>
                                                <td>
                                                    <p class="text-xs font-weight-bold mb-0">
                                                        <?php 
                                                        // Fetch members for this community
                                                        $communityId = $community['id'];
                                                        $members = callAPI('GET', COMMUNITIES_API . '/obtener-miembros/' . $communityId, null);
                                                        
                                                        // Check if members data is valid - the API returns an array of members directly
                                                        if (!is_array($members)) {
                                                            $members = [];
                                                        }
                                                        
                                                        $memberCount = count($members);
                                                        echo $memberCount;
                                                        ?>
                                                    </p>
                                                </td>
                                                <td>
                                                    <span class="text-secondary text-xs font-weight-bold">
                                                        <?php echo isset($community['fecha_creacion']) ? date('d/m/Y', strtotime($community['fecha_creacion'])) : 'N/A'; ?>
                                                    </span>
                                                </td>
                                                <td>
                                                    <?php
                                                    $statusClass = 'bg-gradient-success';
                                                    $statusText = 'Activo';
                                                    
                                                    if (isset($community['tipo_privacidad']) && $community['tipo_privacidad'] === 'suspendido') {
                                                        $statusClass = 'bg-gradient-warning';
                                                        $statusText = 'Suspendido';
                                                    }
                                                    ?>
                                                    <span class="badge <?php echo $statusClass; ?>"><?php echo $statusText; ?></span>
                                                </td>
                                                <td>
                                                    <a href="community-detail.php?id=<?php echo $community['id']; ?>" class="btn btn-link text-info p-0">
                                                        <i class="fas fa-eye me-1"></i>Ver
                                                    </a>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php else: ?>
                                        <tr>
                                            <td colspan="6" class="text-center py-4">
                                                <p class="text-sm mb-0">No hay comunidades disponibles</p>
                                            </td>
                                        </tr>
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

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Filter functionality
        const filterForm = document.getElementById('filterForm');
        const applyFiltersBtn = document.getElementById('applyFilters');
        const resetFiltersBtn = document.getElementById('resetFilters');
        const tableRows = document.querySelectorAll('tbody tr');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function() {
                const nameFilter = document.getElementById('filterName').value.toLowerCase();
                const statusFilter = document.getElementById('filterStatus').value;
                const dateFilter = parseInt(document.getElementById('filterDate').value) || 0;
                
                tableRows.forEach(row => {
                    let showRow = true;
                    
                    // Name filter
                    if (nameFilter) {
                        const communityName = row.querySelector('h6').textContent.toLowerCase();
                        if (!communityName.includes(nameFilter)) {
                            showRow = false;
                        }
                    }
                    
                    // Status filter
                    if (statusFilter && showRow) {
                        const statusBadge = row.querySelector('.badge').textContent.toLowerCase();
                        if (statusFilter === 'activo' && statusBadge !== 'activo') {
                            showRow = false;
                        } else if (statusFilter === 'suspendido' && statusBadge !== 'suspendido') {
                            showRow = false;
                        }
                    }
                    
                    // Date filter
                    if (dateFilter > 0 && showRow) {
                        const dateText = row.querySelector('td:nth-child(4) span').textContent;
                        const rowDate = new Date(dateText.split('/').reverse().join('/'));
                        const today = new Date();
                        const diffTime = Math.abs(today - rowDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays > dateFilter) {
                            showRow = false;
                        }
                    }
                    
                    row.style.display = showRow ? '' : 'none';
                });
            });
        }
        // Reset filters
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function() {
                document.getElementById('filterName').value = '';
                document.getElementById('filterStatus').value = '';
                document.getElementById('filterDate').value = '';
                
                tableRows.forEach(row => {
                    row.style.display = '';
                });
            });
        }
        
        // Chart for communities growth
        var ctx1 = document.getElementById("chart-communities").getContext("2d");
        
        var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);
        gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
        gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
        gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');
        
        // Fetch community stats data
        fetch('<?php echo STATS_API; ?>/communities/summary')
            .then(response => response.json())
            .then(data => {
                const months = data.map(item => {
                    const date = new Date(item.month + '-01');
                    return date.toLocaleString('es-ES', { month: 'short' });
                });
                
                const counts = data.map(item => item.count);
                
                new Chart(ctx1, {
                    type: "line",
                    data: {
                        labels: months,
                        datasets: [{
                            label: "Comunidades",
                            tension: 0.4,
                            borderWidth: 0,
                            pointRadius: 0,
                            borderColor: "#5e72e4",
                            backgroundColor: gradientStroke1,
                            borderWidth: 3,
                            fill: true,
                            data: counts,
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
            })
            .catch(error => {
                console.error('Error fetching community stats:', error);
            });
    });
</script>

<?php include 'views/templates/footer.php'; ?>