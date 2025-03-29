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

$currentPage = 'Comentarios';

// Get comments statistics
$commentsGrowth = callAPI('GET', STATS_API . '/comments/growth', null);
if ($commentsGrowth === null || !is_array($commentsGrowth)) {
    // Default values if API call fails
    $totalComments = 0;
    $publicacionComments = 0;
    $reelComments = 0;
    $historiaComments = 0;
    $totalGrowth = 0;
    $publicacionGrowth = 0;
    $reelGrowth = 0;
    $historiaGrowth = 0;
} else {
    // Process the API response format with the structure provided
    $totalComments = isset($commentsGrowth['comments_count']) ? intval($commentsGrowth['comments_count']) : 0;
    $todayComments = isset($commentsGrowth['today_count']) ? intval($commentsGrowth['today_count']) : 0;
    $previousDayCount = isset($commentsGrowth['previous_day_count']) ? intval($commentsGrowth['previous_day_count']) : 0;
    $totalGrowth = isset($commentsGrowth['growth_percentage']) ? floatval($commentsGrowth['growth_percentage']) : 0;
    $commentersCount = isset($commentsGrowth['commenters_count']) ? intval($commentsGrowth['commenters_count']) : 0;
    $featuredCount = isset($commentsGrowth['featured_count']) ? intval($commentsGrowth['featured_count']) : 0;
    
    // Get comments count by type using the specific endpoint
    $publicacionCommentsData = callAPI('GET', STATS_API . '/comments/count/publicacion', null);
    $reelCommentsData = callAPI('GET', STATS_API . '/comments/count/reel', null);
    $historiaCommentsData = callAPI('GET', STATS_API . '/comments/count/historia', null);
    
    // Process the count data with improved handling for different response formats
    $publicacionComments = 0;
    $reelComments = 0;
    $historiaComments = 0;
    
    // Handle the case where count is an array of objects with date and count properties
    if (isset($publicacionCommentsData['count']) && is_array($publicacionCommentsData['count'])) {
        foreach ($publicacionCommentsData['count'] as $countData) {
            if (isset($countData['count'])) {
                $publicacionComments += intval($countData['count']);
            }
        }
    } else if (isset($publicacionCommentsData['count'])) {
        $publicacionComments = intval($publicacionCommentsData['count']);
    }
    
    if (isset($reelCommentsData['count']) && is_array($reelCommentsData['count'])) {
        foreach ($reelCommentsData['count'] as $countData) {
            if (isset($countData['count'])) {
                $reelComments += intval($countData['count']);
            }
        }
    } else if (isset($reelCommentsData['count'])) {
        $reelComments = intval($reelCommentsData['count']);
    }
    
    if (isset($historiaCommentsData['count']) && is_array($historiaCommentsData['count'])) {
        foreach ($historiaCommentsData['count'] as $countData) {
            if (isset($countData['count'])) {
                $historiaComments += intval($countData['count']);
            }
        }
    } else if (isset($historiaCommentsData['count'])) {
        $historiaComments = intval($historiaCommentsData['count']);
    }

    // Calculate growth percentages for each type if we have previous data
    if ($previousDayCount > 0) {
        $publicacionGrowth = $totalGrowth; // Use overall growth as default
        $reelGrowth = $totalGrowth;
        $historiaGrowth = $totalGrowth;
    } else {
        $publicacionGrowth = 0;
        $reelGrowth = 0;
        $historiaGrowth = 0;
    }
}

// Get monthly comments data for chart
$monthlyComments = callAPI('GET', STATS_API . '/comments/monthly', null);
$monthlyData = [];
$growthText = '';
$growthClass = 'text-secondary';
$arrowClass = '';

// Check if we have monthly data from API
if ($monthlyComments && is_array($monthlyComments) && !empty($monthlyComments)) {
    // Use the actual monthly data from API
    $monthlyData = $monthlyComments;
} else {
    // Fallback: Create a simulated monthly distribution if API doesn't return structured data
    $totalCount = isset($commentsGrowth['comments_count']) ? intval($commentsGrowth['comments_count']) : 0;
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
        $count = max(0, intval($totalCount * $factor / 6));
        
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
if (isset($commentsGrowth['growth_percentage'])) {
    $growth = floatval($commentsGrowth['growth_percentage']);
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
            <!-- Total Comments Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Comentarios Totales</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($totalComments); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <?php 
                                        $totalCommentsGrowth = isset($commentsGrowth['total_comments_growth']) ? 
                                            floatval($commentsGrowth['total_comments_growth']) : $totalGrowth;
                                        ?>
                                        <span class="<?php echo $totalCommentsGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $totalCommentsGrowth >= 0 ? '+' : '';
                                            echo number_format($totalCommentsGrowth, 1); ?>%
                                        </span>
                                        desde ayer
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-primary shadow-primary text-center rounded-circle">
                                    <i class="ni ni-chat-round text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Today's Comments Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Comentarios Hoy</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($todayComments); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <?php 
                                        $todayCommentsGrowth = isset($commentsGrowth['today_comments_growth']) ? 
                                            floatval($commentsGrowth['today_comments_growth']) : $totalGrowth;
                                        ?>
                                        <span class="<?php echo $todayCommentsGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $todayCommentsGrowth >= 0 ? '+' : '';
                                            echo number_format($todayCommentsGrowth, 1); ?>%
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

            <!-- Commenters Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Usuarios Comentando</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($commentersCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <?php 
                                        $commentersGrowth = isset($commentsGrowth['commenters_growth']) ? 
                                            floatval($commentsGrowth['commenters_growth']) : 0;
                                        ?>
                                        <span class="<?php echo $commentersGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $commentersGrowth >= 0 ? '+' : '';
                                            echo number_format($commentersGrowth, 1); ?>%
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

            <!-- Featured Comments Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Comentarios Destacados</p>
                                    <h5 class="font-weight-bolder">
                                        <?php echo number_format($featuredCount); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <?php 
                                        $featuredGrowth = isset($commentsGrowth['featured_comments_growth']) ? 
                                            floatval($commentsGrowth['featured_comments_growth']) : 0;
                                        ?>
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

        <div class="row mt-4">
            <div class="col-lg-7 mb-lg-0 mb-4">
                <div class="card z-index-2 h-100">
                    <div class="card-header pb-0 pt-3 bg-transparent">
                        <h6 class="text-capitalize">Resumen De Comentarios</h6>
                        <p class="text-sm mb-0">
                            <i class="fa <?php echo $arrowClass; ?> <?php echo $growthClass; ?>"></i>
                            <span class="font-weight-bold"><?php echo $growthText; ?></span> este mes
                        </p>
                    </div>
                    <div class="card-body p-3">
                        <div class="chart">
                            <canvas id="chart-line" class="chart-canvas" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card h-100">
                    <div class="card-header pb-0 p-3">
                        <h6 class="mb-0">Distribución de Comentarios</h6>
                    </div>
                    <div class="card-body p-3">
                        <div class="chart">
                            <canvas id="chart-pie" class="chart-canvas" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-lg-8 mb-lg-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0 p-3">
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-2">Comentarios Recientes</h6>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table align-items-center">
                            <thead>
                                <tr>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Contenido</th>
                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tipo</th>
                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                // Get recent comments from all types
                                $recentComments = [];

                                // Get comments from publicaciones
                                $publicacionComments = callAPI('GET', COMMENTS_API . '/posts', null);
                                if ($publicacionComments && is_array($publicacionComments)) {
                                    foreach ($publicacionComments as $comment) {
                                        $comment['tipo'] = 'publicacion';
                                        $recentComments[] = $comment;
                                    }
                                }

                                // Get comments from reels
                                $reelComments = callAPI('GET', COMMENTS_API . '/reels', null);
                                if ($reelComments && is_array($reelComments)) {
                                    foreach ($reelComments as $comment) {
                                        $comment['tipo'] = 'reel';
                                        $recentComments[] = $comment;
                                    }
                                }

                                // Sort by date (newest first)
                                usort($recentComments, function ($a, $b) {
                                    return strtotime($b['fecha_creacion']) - strtotime($a['fecha_creacion']);
                                });

                                // Pagination settings
                                $commentsPerPage = 5;
                                $totalComments = count($recentComments);
                                $totalPages = ceil($totalComments / $commentsPerPage);

                                // Get current page
                                $currentPage = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
                                $currentPage = min($currentPage, $totalPages > 0 ? $totalPages : 1);

                                // Calculate start and end indices
                                $startIndex = ($currentPage - 1) * $commentsPerPage;
                                $currentPageComments = array_slice($recentComments, $startIndex, $commentsPerPage);

                                if (!empty($currentPageComments)) {
                                    foreach ($currentPageComments as $comment) {
                                        // Get user details - make sure we're using the correct endpoint
                                        $userDetails = callAPI('GET', USERS_API . '/usuario/' . $comment['id_usuario'], null);
                                        
                                        // Debug user details if needed
                                        // echo '<pre>'; print_r($userDetails); echo '</pre>';
                                        
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
                                        $date = new DateTime($comment['fecha_creacion']);
                                        $date->setTimezone(new DateTimeZone('America/Bogota')); // Set to Colombia timezone
                                        $formattedDate = $date->format('Y-m-d H:i:s');
                                        
                                        // Truncate content if too long
                                        $content = $comment['contenido'];
                                        if (strlen($content) > 50) {
                                            $content = substr($content, 0, 47) . '...';
                                        }
                                        
                                        // Determine badge color based on content type
                                        $badgeClass = 'bg-gradient-primary';
                                        if ($comment['tipo'] === 'reel') {
                                            $badgeClass = 'bg-gradient-success';
                                        } elseif ($comment['tipo'] === 'historia') {
                                            $badgeClass = 'bg-gradient-warning';
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
                                                <span class="badge badge-sm <?php echo $badgeClass; ?>"><?php echo ucfirst($comment['tipo']); ?></span>
                                            </td>
                                            <td class="align-middle text-center">
                                                <span class="text-secondary text-xs font-weight-bold"><?php echo $formattedDate; ?></span>
                                            </td>
                                        </tr>
                                    <?php
                                    }
                                } else {
                                    ?>
                                    <tr>
                                        <td colspan="4" class="text-center">No hay comentarios disponibles</td>
                                    </tr>
                                <?php
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <?php if ($totalPages > 1): ?>
                        <div class="card-footer pb-0">
                            <div class="d-flex justify-content-center">
                                <nav aria-label="Page navigation">
                                    <ul class="pagination">
                                        <?php if ($currentPage > 1): ?>
                                            <li class="page-item">
                                                <a class="page-link" href="?page=<?php echo $currentPage - 1; ?>" aria-label="Previous">
                                                    <span aria-hidden="true">&laquo;</span>
                                                </a>
                                            </li>
                                        <?php endif; ?>

                                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                                            <li class="page-item <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                                <a class="page-link" href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                                            </li>
                                        <?php endfor; ?>

                                        <?php if ($currentPage < $totalPages): ?>
                                            <li class="page-item">
                                                <a class="page-link" href="?page=<?php echo $currentPage + 1; ?>" aria-label="Next">
                                                    <span aria-hidden="true">&raquo;</span>
                                                </a>
                                            </li>
                                        <?php endif; ?>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card h-100">
                    <div class="card-header pb-0 p-3">
                        <h6 class="mb-0">Usuarios Más Activos</h6>
                    </div>
                    <div class="card-body p-3">
                        <ul class="list-group">
                            <?php
                            // Get most active users (users with most comments)
                            $activeUsers = [];
                            // In a real implementation, you would call an API endpoint to get this data
                            // For now, we'll simulate it by counting comments per user
                            $userCommentCounts = [];
                            foreach ($recentComments as $comment) {
                                $userId = $comment['id_usuario'];
                                if (!isset($userCommentCounts[$userId])) {
                                    $userCommentCounts[$userId] = 0;
                                }
                                $userCommentCounts[$userId]++;
                            }
                            // Sort by comment count (descending)
                            arsort($userCommentCounts);
                            // Get top 5 users
                            $topUserIds = array_slice(array_keys($userCommentCounts), 0, 5);
                            if (!empty($topUserIds)) {
                                foreach ($topUserIds as $userId) {
                                    // Get user details with improved error handling
                                    $userDetails = callAPI('GET', USERS_API . '/usuario/' . $userId, null);
                                    
                                    // Initialize default values
                                    $username = 'Usuario ' . $userId;
                                    $avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                    $commentCount = $userCommentCounts[$userId];
                                    
                                    // Process user data with better handling of different response formats
                                    if (!empty($userDetails)) {
                                        if (is_array($userDetails) && isset($userDetails[0])) {
                                            // API returns array of users
                                            $user = $userDetails[0];
                                            $username = isset($user['username']) ? $user['username'] : 
                                                      (isset($user['nombre']) ? $user['nombre'] : $username);
                                            
                                            if (isset($user['avatar']) && !empty($user['avatar'])) {
                                                $avatarUrl = 'http://localhost:3009' . $user['avatar'];
                                            }
                                        } 
                                        else if (is_array($userDetails) && (isset($userDetails['username']) || isset($userDetails['nombre']))) {
                                            // API returns user object directly
                                            $username = isset($userDetails['username']) ? $userDetails['username'] : 
                                                      (isset($userDetails['nombre']) ? $userDetails['nombre'] : $username);
                                            
                                            if (isset($userDetails['avatar']) && !empty($userDetails['avatar'])) {
                                                $avatarUrl = 'http://localhost:3009' . $userDetails['avatar'];
                                            }
                                        }
                                    }
                            ?>
                                    <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                        <div class="d-flex align-items-center">
                                            <div class="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                                                <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-sm me-3" alt="user image">
                                            </div>
                                            <div class="d-flex flex-column">
                                                <h6 class="mb-1 text-dark text-sm"><?php echo htmlspecialchars($username); ?></h6>
                                                <span class="text-xs"><?php echo $commentCount; ?> comentarios</span>
                                            </div>
                                        </div>
                                        <div class="d-flex">
                                            <a href="user-detail.php?id=<?php echo $userId; ?>" class="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto">
                                                <i class="ni ni-bold-right" aria-hidden="true"></i>
                                            </a>
                                        </div>
                                    </li>
                                <?php
                                    }
                                } else {
                                ?>
                                <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                    <div class="d-flex align-items-center">
                                        <div class="d-flex flex-column">
                                            <h6 class="mb-1 text-dark text-sm">No hay datos disponibles</h6>
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
    </div>
</main>

<?php include 'views/templates/footer.php'; ?>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Line chart for comments over time
        var ctx1 = document.getElementById("chart-line").getContext("2d");

        var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);
        gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
        gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
        gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');

        // Monthly data for chart
        const monthlyData = <?php echo json_encode($monthlyData); ?>;

        const labels = monthlyData.length > 0 ?
            monthlyData.map(item => item.month) : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        const values = monthlyData.length > 0 ?
            monthlyData.map(item => item.count) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            new Chart(ctx1, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Comentarios",
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

                // Pie chart for comment distribution
                var ctx2 = document.getElementById("chart-pie").getContext("2d");

                // Get the data for the pie chart from PHP variables
                const publicacionData = <?php echo json_encode($publicacionComments); ?>;
                const reelData = <?php echo json_encode($reelComments); ?>;

                // Calculate the counts based on whether we have arrays or numbers
                const publicacionCount = Array.isArray(publicacionData) ? publicacionData.length : 
                                    (typeof publicacionData === 'number' ? publicacionData : 0);
                const reelCount = Array.isArray(reelData) ? reelData.length : 
                                (typeof reelData === 'number' ? reelData : 0);

                // Make sure we have at least some data to display
                const hasData = publicacionCount > 0 || reelCount > 0;
                
                

                // Create the pie chart - removed Historias
                new Chart(ctx2, {
                    type: 'pie',
                    data: {
                        labels: ['Publicaciones', 'Reels'],
                        datasets: [{
                            label: "Comentarios",
                            weight: 9,
                            cutout: 0,
                            tension: 0.9,
                            pointRadius: 2,
                            borderWidth: 2,
                            backgroundColor: ['#17c1e8', '#5e72e4'],
                            data: hasData ? [publicacionCount, reelCount] : [1, 1], // Fallback data if all zeros
                            fill: false
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: '#b2b9bf',
                                    font: {
                                        size: 14,
                                        family: "Open Sans",
                                        style: 'normal',
                                        lineHeight: 2
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index',
                        },
                    },
                });
    });
</script>