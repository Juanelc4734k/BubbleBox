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

$currentPage = 'Publicaciones';

// Get publications statistics
$publicacionesGrowth = callAPI('GET', STATS_API . '/posts/growth', null);
if ($publicacionesGrowth === null || !is_array($publicacionesGrowth)) {
    // Default values if API call fails
    $totalPublicaciones = 0;
    $todayPublicaciones = 0;
    $publishersCount = 0;
    $featuredCount = 0;
    $totalGrowth = 0;
    $todayGrowth = 0;
    $publishersGrowth = 0;
    $featuredGrowth = 0;
} else {
    // Process the API response format with the structure provided
    $totalPublicaciones = isset($publicacionesGrowth['posts_count']) ? intval($publicacionesGrowth['posts_count']) : 0;
    $todayPublicaciones = isset($publicacionesGrowth['today_count']) ? intval($publicacionesGrowth['today_count']) : 0;
    $publishersCount = isset($publicacionesGrowth['publishers_count']) ? intval($publicacionesGrowth['publishers_count']) : 0;
    $featuredCount = isset($publicacionesGrowth['featured_count']) ? intval($publicacionesGrowth['featured_count']) : 0;
    
    $totalGrowth = isset($publicacionesGrowth['total_posts_growth']) ? floatval($publicacionesGrowth['total_posts_growth']) : 0;
    $todayGrowth = isset($publicacionesGrowth['today_posts_growth']) ? floatval($publicacionesGrowth['today_posts_growth']) : 0;
    $publishersGrowth = isset($publicacionesGrowth['publishers_growth']) ? floatval($publicacionesGrowth['publishers_growth']) : 0;
    $featuredGrowth = isset($publicacionesGrowth['featured_posts_growth']) ? floatval($publicacionesGrowth['featured_posts_growth']) : 0;
}

// Get monthly publications data for chart
$monthlyData = [];

// Get monthly data for chart
$monthlyPosts = callAPI('GET', STATS_API . '/posts/monthly', null);
if ($monthlyPosts && is_array($monthlyPosts)) {
    foreach ($monthlyPosts as $monthData) {
        if (isset($monthData['month']) && isset($monthData['count'])) {
            $monthlyData[] = [
                'month' => $monthData['month'],
                'count' => $monthData['count'],
                'growth' => isset($monthData['growth']) ? $monthData['growth'] : 0
            ];
        }
    }
}

// If no monthly data available, create simulated data
if (empty($monthlyData)) {
    $currentMonth = intval(date('m'));
    $currentYear = intval(date('Y'));

    // Generate last 6 months of data
    for ($i = 5; $i >= 0; $i--) {
        $month = $currentMonth - $i;
        $year = $currentYear;
        
        if ($month <= 0) {
            $month += 12;
            $year--;
        }
        
        $monthName = date('M', mktime(0, 0, 0, $month, 1, $year));
        
        // Distribute total count with some randomness for visualization
        $factor = ($i == 0) ? 1 : (1 - (0.1 * $i) + (mt_rand(-10, 10) / 100));
        $count = max(0, intval($totalPublicaciones * $factor / 6));
        
        // Calculate growth compared to previous month
        $growth = 0;
        if (count($monthlyData) > 0) {
            $prevCount = $monthlyData[count($monthlyData) - 1]['count'];
            if ($prevCount > 0) {
                $growth = (($count - $prevCount) / $prevCount) * 100;
            }
        }
        
        $monthlyData[] = [
            'month' => $monthName,
            'count' => $count,
            'growth' => $growth
        ];
    }
}

// Get growth text for display in the UI
$growthText = '';
$growthClass = 'text-secondary';
$arrowClass = '';

if (isset($publicacionesGrowth['growth_percentage'])) {
    $growth = floatval($publicacionesGrowth['growth_percentage']);
    $growthClass = $growth > 0 ? 'text-success' : ($growth < 0 ? 'text-danger' : 'text-secondary');
    $arrowClass = $growth > 0 ? 'fa-arrow-up' : ($growth < 0 ? 'fa-arrow-down' : '');
    $growthText = $growth != 0 ? number_format(abs($growth), 1) . '% ' . ($growth > 0 ? 'más' : 'menos') : 'Sin cambios';
} else if (!empty($monthlyData)) {
    // Fallback to using the last month's growth from our generated data
    $latestMonth = end($monthlyData);
    $growth = isset($latestMonth['growth']) ? $latestMonth['growth'] : 0;
    $growthClass = $growth > 0 ? 'text-success' : ($growth < 0 ? 'text-danger' : 'text-secondary');
    $arrowClass = $growth > 0 ? 'fa-arrow-up' : ($growth < 0 ? 'fa-arrow-down' : '');
    $growthText = $growth != 0 ? number_format(abs($growth), 1) . '% ' . ($growth > 0 ? 'más' : 'menos') : 'Sin cambios';
}

include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">

    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <!-- Statistics Cards -->
        <div class="row">
            <!-- Total Publications Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Publicaciones Totales</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($totalPublicaciones); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $totalGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $totalGrowth >= 0 ? '+' : '';
                                            echo number_format($totalGrowth, 1); ?>%
                                        </span>
                                        desde ayer
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

            <!-- Today's Publications Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Publicaciones Hoy</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($todayPublicaciones); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $todayGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $todayGrowth >= 0 ? '+' : '';
                                            echo number_format($todayGrowth, 1); ?>%
                                        </span>
                                        desde ayer
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-danger shadow-danger text-center rounded-circle">
                                    <i class="ni ni-calendar-grid-58 text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Publishers Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Usuarios Publicando</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($publishersCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $publishersGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $publishersGrowth >= 0 ? '+' : '';
                                            echo number_format($publishersGrowth, 1); ?>%
                                        </span>
                                        desde ayer
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-success shadow-success text-center rounded-circle">
                                    <i class="ni ni-single-02 text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Featured Publications Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Publicaciones Destacadas</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($featuredCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $featuredGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $featuredGrowth >= 0 ? '+' : '';
                                            echo number_format($featuredGrowth, 1); ?>%
                                        </span>
                                        desde ayer
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-warning shadow-warning text-center rounded-circle">
                                    <i class="ni ni-trophy text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="row mt-4">
            <!-- Monthly Publications Chart -->
            <div class="col-lg-7 mb-lg-0 mb-4">
                <div class="card z-index-2 h-100">
                    <div class="card-header pb-0 pt-3 bg-transparent">
                        <h6 class="text-capitalize">Resumen de Publicaciones</h6>
                        <p class="text-sm mb-0">
                            <?php if (!empty($arrowClass)): ?>
                                <i class="fa <?php echo $arrowClass; ?> <?php echo $growthClass; ?>"></i>
                            <?php endif; ?>
                            <span class="font-weight-bold"><?php echo !empty($growthText) ? $growthText : 'Sin cambios'; ?></span> este mes
                        </p>
                    </div>
                    <div class="card-body p-3">
                        <div class="chart">
                            <canvas id="chart-line" class="chart-canvas" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Publications -->
            <div class="col-lg-5">
                <div class="card">
                    <div class="card-header pb-0 p-3">
                        <h6 class="mb-0">Publicaciones Recientes</h6>
                    </div>
                    <div class="card-body p-3">
                        <ul class="list-group">
                            <?php
                            // Get recent publications - without limit parameter
                            $recentPosts = callAPI('GET', POSTS_API . '/obtener-todos', null);
                            
                            if ($recentPosts && is_array($recentPosts)) {
                                // Sort posts by date (newest first)
                                usort($recentPosts, function($a, $b) {
                                    return strtotime($b['fecha_creacion']) - strtotime($a['fecha_creacion']);
                                });
                                
                                // Manually limit to 5 posts
                                $recentPosts = array_slice($recentPosts, 0, 5);
                                
                                foreach ($recentPosts as $post) {
                                    // Get user details
                                    $userDetails = callAPI('GET', USERS_API . '/usuario/' . $post['id_usuario'], null);
                                    
                                    // Check if we got valid user data
                                    $username = 'Usuario Desconocido';
                                    $avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                    
                                    // Rest of the user details code remains the same
                                    if (!empty($userDetails) && is_array($userDetails)) {
                                        // If the API returns an array with user object
                                        if (isset($userDetails[0])) {
                                            $user = $userDetails[0];
                                            $username = isset($user['username']) ? $user['username'] : 
                                                      (isset($user['nombre']) ? $user['nombre'] : 'Usuario Desconocido');
                                            
                                            if (isset($user['avatar']) && !empty($user['avatar'])) {
                                                $avatarUrl = 'http://localhost:3009' . $user['avatar'];
                                            }
                                        } 
                                        // If the API returns the user object directly
                                        else if (isset($userDetails['username']) || isset($userDetails['nombre'])) {
                                            $username = isset($userDetails['username']) ? $userDetails['username'] : 
                                                      (isset($userDetails['nombre']) ? $userDetails['nombre'] : 'Usuario Desconocido');
                                            
                                            if (isset($userDetails['avatar']) && !empty($userDetails['avatar'])) {
                                                $avatarUrl = 'http://localhost:3009' . $userDetails['avatar'];
                                            }
                                        }
                                    }
                                    
                                    // Format date
                                    $date = new DateTime($post['fecha_creacion']);
                                    $date->setTimezone(new DateTimeZone('America/Bogota')); // Set to Colombia timezone
                                    $formattedDate = $date->format('Y-m-d H:i:s');
                                    
                                    // Truncate content if too long
                                    $content = $post['contenido'];
                                    if (strlen($content) > 50) {
                                        $content = substr($content, 0, 47) . '...';
                                    }
                            ?>
                                <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                    <div class="d-flex align-items-center">
                                        <div class="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                                            <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-sm me-3" alt="user image">
                                        </div>
                                        <div class="d-flex flex-column">
                                            <h6 class="mb-1 text-dark text-sm"><?php echo htmlspecialchars($username); ?></h6>
                                            <span class="text-xs"><?php echo htmlspecialchars($content); ?></span>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center text-sm">
                                        <?php echo $formattedDate; ?>
                                    </div>
                                </li>
                            <?php
                                }
                            } else {
                            ?>
                                <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                    <div class="d-flex align-items-center">
                                        <div class="d-flex flex-column">
                                            <span class="text-xs">No hay publicaciones recientes disponibles</span>
                                        </div>
                                    </div>
                                </li>
                            <?php
                            }
                            ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Publications Table -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0">
                        <h6>Listado de Publicaciones</h6>
                    </div>
                    <div class="card-body px-0 pt-0 pb-2">
                        <div class="table-responsive p-0">
                            <table class="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Contenido</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Interacciones</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Fecha</th>
                                        <th class="text-secondary opacity-7"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                <?php
                                // Get all publications
                                $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                                $limit = 10; // Items per page
                                $offset = ($page - 1) * $limit;
                                
                                // Add sorting parameter (newest first)
                                $allPosts = callAPI('GET', POSTS_API . '/obtener-todos?limit=' . $limit . '&offset=' . $offset . '&sort=desc', null);
                                $totalPosts = callAPI('GET', STATS_API . '/posts/count', null);
                                $totalCount = isset($totalPosts['count']) ? intval($totalPosts['count']) : 0;
                                $totalPages = ceil($totalCount / $limit);
                                
                                if ($allPosts && is_array($allPosts)) {
                                    // Sort posts by date (newest first) if API doesn't support sorting
                                    usort($allPosts, function($a, $b) {
                                        return strtotime($b['fecha_creacion']) - strtotime($a['fecha_creacion']);
                                    });
                                    
                                    foreach ($allPosts as $post) {
                                        // Get user details
                                        $userDetails = callAPI('GET', USERS_API . '/usuario/' . $post['id_usuario'], null);
                                        
                                        // Check if we got valid user data
                                        $username = 'Usuario Desconocido';
                                        $email = '';
                                        $avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                        
                                        if (!empty($userDetails) && is_array($userDetails)) {
                                            // If the API returns an array with user object
                                            if (isset($userDetails[0])) {
                                                $user = $userDetails[0];
                                                $username = isset($user['username']) ? $user['username'] : 
                                                          (isset($user['nombre']) ? $user['nombre'] : 'Usuario Desconocido');
                                                $email = isset($user['email']) ? $user['email'] : '';
                                                
                                                if (isset($user['avatar']) && !empty($user['avatar'])) {
                                                    $avatarUrl = 'http://localhost:3009' . $user['avatar'];
                                                }
                                            } 
                                            // If the API returns the user object directly
                                            else if (isset($userDetails['username']) || isset($userDetails['nombre'])) {
                                                $username = isset($userDetails['username']) ? $userDetails['username'] : 
                                                          (isset($userDetails['nombre']) ? $userDetails['nombre'] : 'Usuario Desconocido');
                                                $email = isset($userDetails['email']) ? $userDetails['email'] : '';
                                                
                                                if (isset($userDetails['avatar']) && !empty($userDetails['avatar'])) {
                                                    $avatarUrl = 'http://localhost:3009' . $userDetails['avatar'];
                                                }
                                            }
                                        }
                                        
                                        // Format date
                                        $date = new DateTime($post['fecha_creacion']);
                                        $date->setTimezone(new DateTimeZone('America/Bogota')); // Set to Colombia timezone
                                        $formattedDate = $date->format('Y-m-d H:i:s');
                                        
                                        // Truncate content if too long
                                        $content = $post['contenido'];
                                        if (strlen($content) > 50) {
                                            $content = substr($content, 0, 47) . '...';
                                        }
                                        
                                        // Get interactions count
                                        $commentsCount = 0;
                                        $reactionsCount = 0;
                                        
                                        // Get comments count
                                        $comments = callAPI('GET', COMMENTS_API . '/publicaciones/' . $post['id'] .'/comentarios', null);
                                        if ($comments && is_array($comments)) {
                                            $commentsCount = count($comments);
                                        }
                                        
                                        // Get reactions count
                                        $reactions = callAPI('GET', REACCIONES_API . '/reacciones-publicacion/' . $post['id'], null);
                                        if ($reactions && is_array($reactions)) {
                                            $reactionsCount = count($reactions);
                                        }
                                        
                                        $totalInteractions = $commentsCount + $reactionsCount;
                                        
                                        // Determine badge color based on interactions
                                        $badgeClass = 'bg-gradient-secondary';
                                        if ($totalInteractions >= 20) {
                                            $badgeClass = 'bg-gradient-success';
                                        } elseif ($totalInteractions >= 10) {
                                            $badgeClass = 'bg-gradient-primary';
                                        } elseif ($totalInteractions >= 5) {
                                            $badgeClass = 'bg-gradient-info';
                                        }
                                ?>
                                        <tr>
                                            <td>
                                                <div class="d-flex px-2 py-1">
                                                    <div>
                                                        <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-sm me-3" alt="user image">
                                                    </div>
                                                    <div class="d-flex flex-column justify-content-center">
                                                        <h6 class="mb-0 text-sm"><?php echo htmlspecialchars($username); ?></h6>
                                                        <p class="text-xs text-secondary mb-0"><?php echo htmlspecialchars($email); ?></p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p class="text-xs font-weight-bold mb-0"><?php echo htmlspecialchars($content); ?></p>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="badge badge-sm <?php echo $badgeClass; ?>"><?php echo $totalInteractions; ?></span>
                                            </td>
                                            <td class="align-middle text-center">
                                                <span class="text-secondary text-xs font-weight-bold"><?php echo $formattedDate; ?></span>
                                            </td>
                                            <td class="align-middle">
                                                <a href="post-detail.php?id=<?php echo $post['id']; ?>" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Ver detalles">
                                                    Ver
                                                </a>
                                            </td>
                                        </tr>
                                <?php
                                    }
                                } else {
                                ?>
                                    <tr>
                                        <td colspan="5" class="text-center">No hay publicaciones disponibles</td>
                                    </tr>
                                <?php
                                }
                                ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Chart.js script -->
<script>
    document.addEventListener("DOMContentLoaded", function() {
        var ctx = document.getElementById("chart-line").getContext("2d");

        var gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);
        gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
        gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
        gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');

        // Sort monthly data chronologically (oldest to newest)
        <?php
        // Convert month abbreviations to numbers for proper sorting
        $monthOrder = [];
        $monthNames = [];
        $monthCounts = [];
        
        foreach ($monthlyData as $index => $data) {
            $monthNum = date('n', strtotime('1 ' . $data['month'] . ' ' . date('Y')));
            $monthOrder[$index] = $monthNum + (strpos($data['month'], date('Y')) !== false ? 0 : -12);
            $monthNames[$index] = $data['month'];
            $monthCounts[$index] = $data['count'];
        }
        
        // Sort the data by month order
        array_multisort($monthOrder, SORT_ASC, $monthNames, $monthCounts);
        ?>

        new Chart(ctx, {
            type: "line",
            data: {
                labels: [
                    <?php
                    foreach ($monthNames as $month) {
                        echo "'" . $month . "', ";
                    }
                    ?>
                ],
                datasets: [{
                    label: "Publicaciones",
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0,
                    borderColor: "#5e72e4",
                    backgroundColor: gradientStroke1,
                    borderWidth: 3,
                    fill: true,
                    data: [
                        <?php
                        foreach ($monthCounts as $count) {
                            echo $count . ", ";
                        }
                        ?>
                    ],
                    maxBarThickness: 6
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Publicaciones: ' + context.raw;
                            }
                        }
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
    });
</script>

<?php include 'views/templates/footer.php'; ?>