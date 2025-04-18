<aside class="sidenav bg-white navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-4" id="sidenav-main">
    <div class="sidenav-header">
        <i class="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
        <a class="navbar-brand m-0" href="#">
            <img src="public/assets/img/logoBubbleBox-removebg-preview.png" class="navbar-brand-img h-100" alt="main_logo">
            <span class="ms-1 font-weight-bold">BubbleBox - Admin</span>
        </a>
    </div>
    <hr class="horizontal dark mt-0">
    <div class="collapse navbar-collapse w-auto" id="sidenav-collapse-main">
        <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link <?php echo (!isset($currentPage) || $currentPage == 'dashboard') ? 'active' : ''; ?>" href="index.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-spaceship text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Principal</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'users') ? 'active' : ''; ?>" href="users.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-single-02 text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Usuarios</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'reels') ? 'active' : ''; ?>" href="reels.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-button-play text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Reels</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'publicaciones') ? 'active' : ''; ?>" href="publicaciones.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-books text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Publicaciones</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'comentarios') ? 'active' : ''; ?>" href="comentarios.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-chat-round text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Comentarios</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'comunidades') ? 'active' : ''; ?>" href="comunidades.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-world text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Comunidades</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'recuperacion') ? 'active' : ''; ?>" href="recover.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-key-25 text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Recuperacion</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo (isset($currentPage) && $currentPage == 'reportes') ? 'active' : ''; ?>" href="reportes.php">
                        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i class="ni ni-chart-bar-32 text-dark text-sm opacity-10"></i>
                        </div>
                        <span class="nav-link-text ms-1">Reportes</span>
                    </a>
                </li>
            </ul>
    </div>
    <div class="sidenav-footer mx-3 ">
      <div class="card card-plain shadow-none" id="sidenavCard">
        <img class="w-50 mx-auto" src="../../public/assets/img/illustrations/icon-documentation.svg" alt="sidebar_illustration">
        <div class="card-body text-center p-3 w-100 pt-0">
          <div class="docs-info">
            <h6 class="mb-0">¿Necesitas ayuda?</h6>
            <p class="text-xs font-weight-bold mb-0">Consulta con soporte</p>
          </div>
        </div>
      </div>
      <a href="https://www.creative-tim.com/learning-lab/bootstrap/license/argon-dashboard" target="_blank" class="btn btn-dark btn-sm w-100 mb-3">Soporte</a>
    </div>
</aside>