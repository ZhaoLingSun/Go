// 侧边栏切换功能
document.addEventListener('DOMContentLoaded', function() {
    const MOBILE_BREAKPOINT = 768;
    
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleBtn');

    // 创建外部菜单按钮
    const overlayToggle = document.createElement('button');
    overlayToggle.className = 'menu-toggle-overlay';
    overlayToggle.textContent = '☰';
    overlayToggle.setAttribute('aria-label', 'Toggle sidebar');
    document.body.appendChild(overlayToggle);

    // 切换侧边栏状态
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // 切换外部菜单按钮显示状态
        if (sidebar.classList.contains('collapsed')) {
            overlayToggle.classList.add('show');
        } else {
            overlayToggle.classList.remove('show');
        }
        
        // 保存侧边栏状态到 localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    // 点击切换按钮
    toggleBtn.addEventListener('click', toggleSidebar);

    // 点击外部菜单按钮
    overlayToggle.addEventListener('click', toggleSidebar);

    // 从 localStorage 恢复侧边栏状态
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
        overlayToggle.classList.add('show');
    }

    // 导航链接点击事件
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 添加活动状态到当前链接
            this.classList.add('active');
            
            // 在移动设备上，点击导航后自动收起侧边栏
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                toggleSidebar();
            }
        });
    });



    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
