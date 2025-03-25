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

$currentPage = 'Usuarios';

// Get user statistics
$userStats = callAPI('GET', STATS_API . '/users/stats', null);
if ($userStats === null) {
    // Default values if API call fails
    $connectedUsers = 0;
    $totalUsers = 0;
    $inactiveUsers = 0;
    $featuredUsers = 0;
    $connectedGrowth = 0;
    $totalGrowth = 0;
    $inactiveGrowth = 0;
    $featuredGrowth = 0;
} else {
    $connectedUsers = isset($userStats['connected']) ? intval($userStats['connected']) : 0;
    $totalUsers = isset($userStats['total']) ? intval($userStats['total']) : 0;
    $inactiveUsers = isset($userStats['inactive']) ? intval($userStats['inactive']) : 0;
    $featuredUsers = isset($userStats['featured']) ? intval($userStats['featured']) : 0;
    $connectedGrowth = isset($userStats['connected_growth']) ? floatval($userStats['connected_growth']) : 0;
    $totalGrowth = isset($userStats['total_growth']) ? floatval($userStats['total_growth']) : 0;
    $inactiveGrowth = isset($userStats['inactive_growth']) ? floatval($userStats['inactive_growth']) : 0;
    $featuredGrowth = isset($userStats['featured_growth']) ? floatval($userStats['featured_growth']) : 0;
}

// Get other stats
$stats = callAPI('GET', STATS_API . '/getStats', null);
if ($stats === null) {
    $postsGrowth = 0;
    $comentsGrowth = 0;
    $featuredPostsGrowth = 0;
} else {
    $postsGrowth = isset($stats['posts']['growth_percentage']) ? floatval($stats['posts']['growth_percentage']) : 0;
    $comentsGrowth = isset($stats['comments']['growth_percentage'])? floatval($stats['comments']['growth_percentage']) : 0;
    $featuredPostsGrowth = isset($stats['postsFeatured']['growth_percentage']) ? floatval($stats['postsFeatured']['growth_percentage']) : 0;
}

$userSummary = callAPI('GET', STATS_API . '/users/summary', null);
$latestMonth = !empty($userSummary) ? end($userSummary) : null;
$growthText = '';
$growthClass = 'text-secondary';
$arrowClass = '';
              
if ($latestMonth && isset($latestMonth['growth'])) {
    $growth = $latestMonth['growth'];
    $growthClass = $growth > 0 ? 'text-success' : ($growth < 0 ? 'text-danger' : 'text-secondary');
    $arrowClass = $growth > 0 ? 'fa-arrow-up' : ($growth < 0 ? 'fa-arrow-down' : '');
    $growthText = $growth != 0 ? abs($growth) . ' ' . ($growth > 0 ? 'más' : 'menos') : 'Sin cambios';
}


include 'views/templates/header.php';
include 'views/templates/sidebar.php';

?>

<main class="main-content position-relative border-radius-lg">
    
    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <!-- Title and PDF button -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4>Dashboard de Usuarios</h4>
            <button class="btn btn-primary" onclick="generateUsersPDF()">
                <i class="ni ni-cloud-download-95 me-2"></i> Descargar PDF
            </button>
        </div>
        
        <!-- Your dashboard content here -->
        <div class="row">
            <!-- Total Users Card -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Usuarios Conectados</p>
                                    <h5 class="font-weight-bolder">
                                    <?php echo number_format($connectedUsers); ?>
                                    </h5>
                                    <p class="mb-0">
                                    <span class="<?php echo $connectedGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $connectedGrowth >= 0 ? '+' : ''; echo number_format($connectedGrowth, 1); ?>%
                                    </span>
                                        desde ayer
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-primary shadow-primary text-center rounded-circle">
                                    <i class="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Publicaciones Hoy -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Usuarios Totales</p>
                                    <h5 class="font-weight-bolder">
                                    <?php echo number_format($totalUsers); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $totalGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $totalGrowth >= 0 ? '+' : ''; echo number_format($totalGrowth, 1); ?>%
                                        </span>
                                        desde la semana pasada
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-danger shadow-danger text-center rounded-circle">
                                    <i class="ni ni-world text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Total Comentarios -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Usuarios inactivos</p>
                                    <h5 class="font-weight-bolder">
                                    <?php echo number_format($inactiveUsers); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $inactiveGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $inactiveGrowth >= 0 ? '+' : ''; echo number_format($inactiveGrowth, 1); ?>%
                                        </span>
                                        desde el último mes
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-success shadow-success text-center rounded-circle">
                                    <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Usuarios destacadas -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Usuarios Destacados</p>
                                    <h5 class="font-weight-bolder">
                                    <?php echo number_format($featuredUsers); ?>
                                    </h5>
                                    <p class="mb-0">
                                        <span class="<?php echo $featuredGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $featuredGrowth >= 0 ? '+' : ''; echo number_format($featuredGrowth, 1); ?>%
                                        </span> 
                                        que el mes pasado
                                    </p>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <div class="icon icon-shape bg-gradient-warning shadow-warning text-center rounded-circle">
                                    <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
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
              <h6 class="text-capitalize">Resumen De Usuarios</h6>
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
          <div class="card card-carousel overflow-hidden h-100 p-0">
            <div id="carouselExampleCaptions" class="carousel slide h-100" data-bs-ride="carousel">
              <div class="carousel-inner border-radius-lg h-100">
                <div class="carousel-item h-100 active" style="background-image: url('./public/assets/img/carousel-1.jpg');
      background-size: cover;">
                  <div class="carousel-caption d-none d-md-block bottom-0 text-start start-0 ms-5">
                    <div class="icon icon-shape icon-sm bg-white text-center border-radius-md mb-3">
                      <i class="ni ni-camera-compact text-dark opacity-10"></i>
                    </div>
                    <h5 class="text-white mb-1">Bienvenido al dashboard de Bubblebox</h5>
                    <p>En este dashboard podras visualizar toda la informacion acerca del contenido de los usuarios</p>
                  </div>
                </div>
                <div class="carousel-item h-100" style="background-image: url('./public/assets/img/carousel-2.jpg');
      background-size: cover;">
                  <div class="carousel-caption d-none d-md-block bottom-0 text-start start-0 ms-5">
                    <div class="icon icon-shape icon-sm bg-white text-center border-radius-md mb-3">
                      <i class="ni ni-bulb-61 text-dark opacity-10"></i>
                    </div>
                    <h5 class="text-white mb-1">Analiza el Crecimiento de tu Plataforma</h5>
                    <p>Visualiza estadísticas detalladas sobre usuarios, publicaciones y engagement</p>
                  </div>
                </div>
                <div class="carousel-item h-100" style="background-image: url('./public/assets/img/carousel-3.jpg');
      background-size: cover;">
                  <div class="carousel-caption d-none d-md-block bottom-0 text-start start-0 ms-5">
                    <div class="icon icon-shape icon-sm bg-white text-center border-radius-md mb-3">
                      <i class="ni ni-trophy text-dark opacity-10"></i>
                    </div>
                    <h5 class="text-white mb-1">Mantén tu Comunidad Activa</h5>
                    <p>Supervisa las interacciones y el contenido destacado de tus usuarios</p>
                  </div>
                </div>
              </div>
              <button class="carousel-control-prev w-5 me-3" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next w-5 me-3" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-lg-8 mb-lg-0 mb-4">
          <div class="card ">
            <div class="card-header pb-0 p-3">
              <div class="d-flex justify-content-between">
                <h6 class="mb-2">Usuarios Destacados</h6>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table align-items-center ">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Publicaciones</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Reels</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total Contenido</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <?php
                  // Get featured users
                  $featuredUsers = callAPI('GET', STATS_API . '/users/featured', null);
                  
                  if ($featuredUsers && is_array($featuredUsers)) {
                      // Pagination settings
                      $usersPerPage = 5;
                      $totalUsers = count($featuredUsers);
                      $totalPages = ceil($totalUsers / $usersPerPage);
                      
                      // Get current page
                      $currentPage = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
                      $currentPage = min($currentPage, $totalPages);
                      
                      // Calculate start and end indices
                      $startIndex = ($currentPage - 1) * $usersPerPage;
                      $currentPageUsers = array_slice($featuredUsers, $startIndex, $usersPerPage);
                      
                      foreach ($currentPageUsers as $user) {
                          $totalContent = ($user['post_count'] ?? 0) + ($user['reel_count'] ?? 0);
                          $statusClass = $user['estado'] === 'conectado' ? 'bg-gradient-success' : 'bg-gradient-secondary';
                          
                          // Get user avatar
                          $avatarUrl = $user['avatar'] 
                              ? 'http://localhost:3009' . $user['avatar'] 
                              : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                  ?>
                  <tr>
                    <td class="w-30">
                      <div class="d-flex px-2 py-1 align-items-center">
                        <div>
                          <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-sm me-3" alt="user avatar">
                        </div>
                        <div class="ms-2">
                          <p class="text-xs font-weight-bold mb-0">Nombre:</p>
                          <h6 class="text-sm mb-0"><?php echo htmlspecialchars($user['nombre'] ?? 'Usuario Desconocido'); ?></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="text-start">
                        <p class="text-xs font-weight-bold mb-0">Posts:</p>
                        <h6 class="text-sm mb-0"><?php echo number_format($user['post_count'] ?? 0); ?></h6>
                      </div>
                    </td>
                    <td>
                      <div class="text-center">
                        <p class="text-xs font-weight-bold mb-0">Reels:</p>
                        <h6 class="text-sm mb-0"><?php echo number_format($user['reel_count'] ?? 0); ?></h6>
                      </div>
                    </td>
                    <td>
                      <div class="text-center">
                        <p class="text-xs font-weight-bold mb-0">Total:</p>
                        <h6 class="text-sm mb-0"><?php echo number_format($totalContent); ?></h6>
                      </div>
                    </td>
                    <td class="align-middle text-sm">
                      <div class="col text-center">
                        <span class="badge badge-sm <?php echo $statusClass; ?>">
                            <?php echo ucfirst($user['estado'] ?? 'desconectado'); ?>
                        </span>
                      </div>
                    </td>
                  </tr>
                  <?php
                      }
                  } else {
                  ?>
                  <tr>
                    <td colspan="5" class="text-center py-4">
                      <p class="text-sm mb-0">No hay usuarios destacados disponibles</p>
                    </td>
                  </tr>
                  <?php
                  }
                  ?>
                </tbody>
              </table>
              <?php if (isset($totalPages) && $totalPages > 1): ?>
              <div class="card-footer d-flex justify-content-center py-2">
                <nav aria-label="Navegación de usuarios">
                  <ul class="pagination pagination-sm m-0">
                    <!-- Previous page -->
                    <li class="page-item <?php echo ($currentPage <= 1) ? 'disabled' : ''; ?>">
                      <a class="page-link" href="?page=<?php echo $currentPage - 1; ?>" aria-label="Anterior">
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>
                    
                    <!-- Page numbers -->
                    <?php 
                    $startPage = max(1, min($currentPage - 2, $totalPages - 4));
                    $endPage = min($totalPages, max(5, $currentPage + 2));
                    
                    if ($endPage - $startPage + 1 < 5 && $totalPages >= 5) {
                        if ($startPage == 1) {
                            $endPage = 5;
                        } else {
                            $startPage = max(1, $totalPages - 4);
                        }
                    }
                    
                    for ($i = $startPage; $i <= $endPage; $i++): 
                    ?>
                      <li class="page-item <?php echo ($i == $currentPage) ? 'active' : ''; ?>">
                        <a class="page-link" href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                      </li>
                    <?php endfor; ?>
                    
                    <!-- Next page -->
                    <li class="page-item <?php echo ($currentPage >= $totalPages) ? 'disabled' : ''; ?>">
                      <a class="page-link" href="?page=<?php echo $currentPage + 1; ?>" aria-label="Siguiente">
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              <?php endif; ?>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header pb-0 p-3">
              <h6 class="mb-0">Categories</h6>
            </div>
            <div class="card-body p-3">
              <ul class="list-group">
                <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                  <div class="d-flex align-items-center">
                    <div class="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                      <i class="ni ni-mobile-button text-white opacity-10"></i>
                    </div>
                    <div class="d-flex flex-column">
                      <h6 class="mb-1 text-dark text-sm">Videos y fotos</h6>
                      <?php
                        $posts = callAPI('GET', POSTS_API . '/obtener-todos', null);
                        $reels = callAPI('GET', REELS_API . '/todosReels', null);
                        
                        $postsWithMedia = 0;
                        if ($posts && is_array($posts)) {
                            $postsWithMedia = count(array_filter($posts, function($post) {
                                return !empty($post['imagen']);
                            }));
                        }
                        
                        $reelsCount = $reels && is_array($reels) ? count($reels) : 0;
                        $totalMedia = $postsWithMedia + $reelsCount;
                      ?>
                      <span class="text-xs">Total: <span class="font-weight-bold"><?php echo $totalMedia; ?></span></span>
                    </div>
                  </div>
                  <div class="d-flex">
                    <button class="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto"><i class="ni ni-bold-right" aria-hidden="true"></i></button>
                  </div>
                </li>
                <li class="list-group-item border-0 d-flex justify-content-between ps-0 border-radius-lg">
                  <div class="d-flex align-items-center">
                    <div class="icon icon-shape icon-sm me-3 bg-gradient-dark shadow text-center">
                      <i class="ni ni-satisfied text-white opacity-10"></i>
                    </div>
                    <div class="d-flex flex-column">
                      <h6 class="mb-1 text-dark text-sm">Usuarios</h6>
                      <?php
                        $users = callAPI('GET', USERS_API . '/usuarios', null);
                        $totalUsers = $users && is_array($users) ? count($users) : 0;
                      ?>
                      <span class="text-xs font-weight-bold">Total: <?php echo $totalUsers; ?></span>
                    </div>
                  </div>
                  <div class="d-flex">
                    <button class="btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right my-auto"><i class="ni ni-bold-right" aria-hidden="true"></i></button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
    
    <!-- PDF Generation Script -->
    <script>
        function generateUsersPDF() {
            // Recopilar los datos para el PDF
            const userData = {
                totalUsers: <?php echo $totalUsers; ?>,
                connectedUsers: <?php echo $connectedUsers; ?>,
                inactiveUsers: <?php echo $inactiveUsers; ?>,
                featuredUsers: <?php echo $featuredUsers; ?>
            };
            
            // Datos mensuales para el gráfico
            const monthlyData = <?php echo json_encode($userSummary ?? []); ?>;
            
            // Llamar a la función de generación de PDF
            pdfGenerator.generateUsersPDF(userData, monthlyData);
        }
    </script>
</main>

<?php
include 'views/templates/footer.php';
?>