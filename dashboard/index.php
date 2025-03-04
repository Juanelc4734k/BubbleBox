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

$currentPage = 'Principal';

$stats = callAPI('GET', STATS_API . '/getStats', null);
if ($stats === null) {
    $userGrowth = 0;
    $postsGrowth = 0;
    $comentsGrowth = 0;
    $featuredPostsGrowth = 0;
} else {
    $userGrowth = isset($stats['users']['growth_percentage']) ? floatval($stats['users']['growth_percentage']) : 0;
    $postsGrowth = isset($stats['posts']['growth_percentage']) ? floatval($stats['posts']['growth_percentage']) : 0;
    $comentsGrowth = isset($stats['comments']['growth_percentage'])? floatval($stats['comments']['growth_percentage']) : 0;
    $featuredPostsGrowth = isset($stats['postsFeatured']['growth_percentage']) ? floatval($stats['postsFeatured']['growth_percentage']) : 0;
}

// Update the featured posts section
$postsFeaturedResponse = callAPI('GET', STATS_API. '/posts/featured', null);
$featuredPostsCount = isset($postsFeaturedResponse['featured_count']) ? $postsFeaturedResponse['featured_count'] : 0;

$postResponse = callAPI('GET', STATS_API . '/posts/today', null);
$postCountToday = isset($postResponse['count']) ? $postResponse['count'] : 0;

$totalCommentsResponse = callAPI('GET', STATS_API. '/comentarios/total', null);
$totalComments = isset($totalCommentsResponse['total'])? $totalCommentsResponse['total'] : 0;

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

// Include header
include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>


<main class="main-content position-relative border-radius-lg">
    
    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
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
                                        <?php 
                                        $users = callAPI('GET', USERS_API . '/usuarios', null);
                                        if ($users === null) {
                                            echo 'Error connecting to API';
                                        } else {
                                            $connectedUsers = array_filter($users, function($user) {
                                                return isset($user['estado']) && $user['estado'] === 'conectado';
                                            });
                                            echo count($connectedUsers);
                                        }
                                        ?>
                                    </h5>
                                    <p class="mb-0">
                                    <span class="<?php echo $userGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                        <?php echo $userGrowth >= 0 ? '+' : ''; echo number_format($userGrowth, 1); ?>%
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
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Publicaciones Hoy</p>
                                    <h5 class="font-weight-bolder">
                                        <?php 
                                        echo $postCountToday;
                                        ?>
                                    </h5>
                                    <p class="mb-0">
                                    <?php if ($postsGrowth !== 0): ?>
                                        <span class="<?php echo $postsGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                            <?php echo $postsGrowth >= 0 ? '+' : ''; echo number_format($postsGrowth, 1); ?>%
                                        </span>
                                        que ayer
                                    <?php else: ?>
                                        <span class="text-secondary text-sm font-weight-bolder">
                                            Sin cambios
                                        </span>
                                    <?php endif; ?>
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
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Comentarios Totales</p>
                                    <h5 class="font-weight-bolder">
                                        <?php 
                                        echo $totalComments;
                                        ?>
                                    </h5>
                                    <p class="mb-0">
                                        <?php if ($comentsGrowth !== 0): ?>
                                            <span class="<?php echo $comentsGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                                <?php echo $comentsGrowth >= 0 ? '+' : ''; echo number_format($comentsGrowth, 1); ?>%
                                            </span>
                                            que ayer
                                        <?php else: ?>
                                            <span class="text-secondary text-sm font-weight-bolder">
                                                Sin cambios
                                            </span>
                                        <?php endif; ?>
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

            <!-- Publicaciones destacadas -->
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-8">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-uppercase font-weight-bold">Publicaciones Destacadas</p>
                                    <h5 class="font-weight-bolder">
                                        <?php 
                                        echo $featuredPostsCount;
                                        ?>
                                    </h5>
                                    <p class="mb-0">
                                        <?php if ($featuredPostsGrowth !== 0): ?>
                                            <span class="<?php echo $featuredPostsGrowth >= 0 ? 'text-success' : 'text-danger'; ?> text-sm font-weight-bolder">
                                                <?php echo $featuredPostsGrowth >= 0 ? '+' : ''; echo number_format($featuredPostsGrowth, 1); ?>%
                                            </span>
                                            que ayer
                                        <?php else: ?>
                                            <span class="text-secondary text-sm font-weight-bolder">
                                                Sin cambios
                                            </span>
                                        <?php endif; ?>
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
                <h6 class="mb-2">Publicaciones Recientes</h6>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table align-items-center ">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Título</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Fecha</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tipo</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <?php
                  // Get recent posts
                  $recentPosts = callAPI('GET', POSTS_API . '/obtener-todos', null);
                  
                  // Sort posts by date (newest first)
                  if ($recentPosts && is_array($recentPosts)) {
                      usort($recentPosts, function($a, $b) {
                          return strtotime($b['fecha_creacion']) - strtotime($a['fecha_creacion']);
                      });
                      
                      // Display only the 5 most recent posts
                      $recentPosts = array_slice($recentPosts, 0, 5);
                      
                      foreach ($recentPosts as $post) {
                          // Format date
                          $date = new DateTime($post['fecha_creacion']);
                          $formattedDate = $date->format('d M Y');
                          
                          // Get user avatar
                          $avatarUrl = $post['avatar_usuario'] 
                              ? 'http://localhost:3009' . $post['avatar_usuario'] 
                              : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                          
                          // Get post type
                          $postType = $post['es_comunidad'] ? 'Comunidad' : 'Personal';
                          $postTypeClass = $post['es_comunidad'] ? 'bg-gradient-primary' : 'bg-gradient-success';
                  ?>
                  <tr>
                    <td class="w-30">
                      <div class="d-flex px-2 py-1 align-items-center">
                        <div>
                          <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-sm me-3" alt="user avatar">
                        </div>
                        <div class="ms-2">
                          <p class="text-xs font-weight-bold mb-0">Usuario:</p>
                          <h6 class="text-sm mb-0"><?php echo $post['nombre_usuario'] ?? 'Usuario Desconocido'; ?></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="text-start">
                        <p class="text-xs font-weight-bold mb-0">Título:</p>
                        <h6 class="text-sm mb-0"><?php echo htmlspecialchars($post['titulo']); ?></h6>
                      </div>
                    </td>
                    <td>
                      <div class="text-center">
                        <p class="text-xs font-weight-bold mb-0">Fecha:</p>
                        <h6 class="text-sm mb-0"><?php echo $formattedDate; ?></h6>
                      </div>
                    </td>
                    <td class="align-middle text-sm">
                      <div class="col text-center">
                        <span class="badge badge-sm <?php echo $postTypeClass; ?>"><?php echo $postType; ?></span>
                      </div>
                    </td>
                    <td class="align-middle text-sm">
                      <div class="col text-center">
                        <?php if ($post['imagen']): ?>
                            <button type="button" class="btn btn-sm btn-info rounded-pill px-3 py-2 shadow-sm" data-bs-toggle="modal" data-bs-target="#imageModal<?php echo $post['id']; ?>" title="Ver publicación">
                                <i class="fas fa-eye me-1"></i>
                                <span class="text-xs">Ver</span>
                            </button>
                          <!-- Modal for this post -->
                          <div class="modal fade" id="imageModal<?php echo $post['id']; ?>" tabindex="-1" aria-labelledby="imageModalLabel<?php echo $post['id']; ?>" aria-hidden="true">
                            <div class="modal-dialog modal-md">
                              <div class="modal-content">
                                <div class="modal-header">
                                  <h5 class="modal-title" id="imageModalLabel<?php echo $post['id']; ?>"><?php echo htmlspecialchars($post['titulo']); ?></h5>
                                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body text-center">
                                  <img src="http://localhost:3008/uploads/<?php echo $post['imagen']; ?>" class="img-fluid" alt="Post Image" style="max-height: 300px; object-fit: contain;">
                                  <div class="mt-3 text-start" style="max-height: 150px; overflow-y: auto; word-wrap: break-word;">
                                    <p><?php echo htmlspecialchars($post['contenido']); ?></p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        <?php else: ?>
                          <span class="badge badge-sm bg-gradient-secondary">Sin imagen</span>
                        <?php endif; ?>
                      </div>
                    </td>
                  </tr>
                  <?php
                      }
                  } else {
                  ?>
                  <tr>
                    <td colspan="4" class="text-center py-4">
                      <p class="text-sm mb-0">No hay publicaciones recientes disponibles</p>
                    </td>
                  </tr>
                  <?php
                  }
                  ?>
                </tbody>
              </table>
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
    
</main>

<?php
include 'views/templates/configurations.php';
include 'views/templates/footer.php';
?>