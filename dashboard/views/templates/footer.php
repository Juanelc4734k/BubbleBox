</div>
    </main>
    <!-- Core JS Files -->
    <script src="../../public/assets/js/core/popper.min.js"></script>
    <script src="../../public/assets/js/core/bootstrap.min.js"></script>
    <script src="../../public/assets/js/plugins/perfect-scrollbar.min.js"></script>
    <script src="../../public/assets/js/plugins/smooth-scrollbar.min.js"></script>
    <script src="../../public/assets/js/plugins/chartjs.min.js"></script>
    <script src="../../public/assets/js/argon-dashboard.js"></script>
    <script>
        var win = navigator.platform.indexOf('Win') > -1;
        if (win && document.querySelector('#sidenav-scrollbar')) {
            var options = {
                damping: '0.5'
            }
            Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
        }
    </script>
            <script>
        // Fix for sidebar color function
        window.sidebarColor = function(element) {
            // Get all nav-links in the sidebar
            const navLinks = document.querySelectorAll('.nav-link');
            if (!navLinks.length) return; // Exit if no nav-links exist
            
            // Remove active class from all color options
            const colorButtons = document.querySelectorAll('.badge-colors .badge');
            colorButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to selected color
            element.classList.add('active');
            
            // Get color from data attribute
            const color = element.getAttribute('data-color');
            
            // Get the icon elements inside nav-links
            navLinks.forEach(navLink => {
                const icon = navLink.querySelector('.icon i');
                if (icon) {
                    // Remove all existing color classes
                    const classes = ['text-primary', 'text-dark', 'text-info', 
                                   'text-success', 'text-warning', 'text-danger'];
                    
                    classes.forEach(cls => {
                        icon.classList.remove(cls);
                    });
                    
                    // Add the new color class
                    icon.classList.add('text-' + color);
                }
            });

            // Update sidebar background if needed
            const sidebar = document.querySelector('.sidenav');
            if (sidebar) {
                const bgClasses = ['bg-gradient-primary', 'bg-gradient-dark', 'bg-gradient-info', 
                                 'bg-gradient-success', 'bg-gradient-warning', 'bg-gradient-danger'];
                
                bgClasses.forEach(cls => {
                    sidebar.classList.remove(cls);
                });
                
                if (color !== 'white') {
                    sidebar.classList.add('bg-gradient-' + color);
                }
            }
        }
    </script>
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            
            try {
                const response = await fetch('<?php echo STATS_API; ?>/users/summary');
                const data = await response.json();

                
                const labels = data.map(entry => entry.month);
                const counts = data.map(entry => entry.count);

                var ctx1 = document.getElementById("chart-line").getContext("2d");
                var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);

                gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
                gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
                gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');

                new Chart(ctx1, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Usuarios",
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
            } catch (error) {
                console.error('Error fetching data:', error);
            } 
        });
    </script>
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            
            try {
                const response = await fetch('<?php echo STATS_API; ?>/reels/summary');
                const data = await response.json();

                console.log(data)

                if (!data || data.length === 0) {
                    console.log('No reels data available');
                    return;
                }

                
                const labels = data.map(entry => {
                    const [year, month] = entry.month.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                });
                const counts = data.map(entry => entry.count);

                var ctx1 = document.getElementById("chart-line-reels").getContext("2d");
                if (!ctx1) {
                    console.error('Chart canvas element not found');
                    return;
                }
                var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);

                gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
                gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
                gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');

                new Chart(ctx1, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Reels",
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
            } catch (error) {
                console.error('Error fetching data:', error);
            } 
        });
    </script>
</body>
</html>