// 导入数据管理模块
import { getGames, setGames, saveGames } from './data/gameData.js';
import { getCustomTags, setCustomTags, saveCustomTags } from './data/customTagData.js';
import { getPlatforms, setPlatforms, savePlatforms } from './data/platformData.js';

// 当整个 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发
document.addEventListener('DOMContentLoaded', () => {
    const savedPageId = localStorage.getItem('currentPageId');
    // 获取页面中所有具有 'page' 类名的元素，这些元素代表不同的页面视图
    const pages = document.querySelectorAll('.page');
    // 获取页面中所有具有 'nav-item' 类名的元素，这些是导航栏的条目
    const navItems = document.querySelectorAll('.nav-item');
    // 获取ID为 'pageTitle' 的元素，用于显示当前页面的标题
    const pageTitle = document.getElementById('pageTitle');
    // 获取具有 'back-btn' 类名的元素，即返回按钮
    const backButton = document.querySelector('.back-btn');
    // 获取具有 'save-btn' 类名的元素，即保存按钮
    const saveButton = document.querySelector('.save-btn');

    // 获取ID为 'addGameForm' 的元素，即添加游戏的表单
    const addGameForm = document.getElementById('addGameForm');
    // 获取ID为 'gameProgress' 的元素，游戏进度输入滑块
    const gameProgressInput = document.getElementById('gameProgress');
    // 获取ID为 'progressValue' 的元素，用于显示游戏进度的百分比
    const progressValueSpan = document.getElementById('progressValue');
    // 获取ID为 'coverPreview' 的元素，用于预览游戏封面图片
    const coverPreview = document.getElementById('coverPreview');
    // 获取ID为 'gameCover' 的元素，游戏封面图片文件输入框
    const gameCoverInput = document.getElementById('gameCover');
    let isCoverInputListenerAttached = false; // 用于跟踪封面上传事件监听器是否已附加
    // 获取ID为 'gameType' 的元素，游戏类型输入框
    const gameTypeSelect = document.getElementById('gameTypeSelect'); // Changed from gameTypeInput

    // 搜索功能相关元素
    const searchBtn = document.querySelector('.search-btn');
    const searchInputContainer = document.querySelector('.search-input-container');
    const appSearchInput = document.getElementById('appSearchInput');
    const closeSearchBtn = document.querySelector('.close-search-btn');
    const searchResultsPage = document.getElementById('searchResultsPage');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const noSearchResults = document.getElementById('noSearchResults');

    // 平台管理相关元素
    const platformManagementPage = document.getElementById('platformManagementPage');
    const platformList = document.getElementById('platformList');
    const newPlatformInput = document.getElementById('newPlatformInput');
    const addPlatformBtn = document.getElementById('addPlatformBtn');
    const gamePlatformSelect = document.getElementById('gamePlatform'); // 用于添加游戏页的平台选择

    // 自定义标签管理相关元素
    const customTagManagementPage = document.getElementById('customTagManagementPage');
    const customTagList = document.getElementById('customTagList');
    const newCustomTagInput = document.getElementById('newCustomTagInput');
    const addCustomTagBtn = document.getElementById('addCustomTagBtn');
    // gameTypeSelect 已在前面获取，用于添加游戏页的类型选择

    // 关于和帮助页面
    const aboutPage = document.getElementById('aboutPage');
    const helpFeedbackPage = document.getElementById('helpFeedbackPage');

    // 初始化当前页面为 'homePage'
    let currentPage = 'homePage';
    // 初始化前一个页面为 null，用于返回功能
    let previousPage = null;

    // 显示指定 ID 的页面
    // pageId: 要显示的页面的 ID
    // isBack: 布尔值，指示是否是返回操作，默认为 false
    function showPage(pageId, isBack = false) {
        // 统一处理搜索框和搜索按钮的显隐
        if (searchInputContainer) searchInputContainer.style.display = 'none'; // 默认隐藏搜索输入框
        if (pageTitle) pageTitle.style.display = 'block'; // 默认显示页面标题
        if (searchBtn) searchBtn.style.display = 'none'; // 默认隐藏搜索按钮，后续根据页面ID决定是否显示

        // 如果不是返回操作，则记录当前页面为前一个页面
        if (!isBack) {
            previousPage = currentPage;
        }
        // 移除所有页面的 'active' 类，使其隐藏
        pages.forEach(page => page.classList.remove('active'));
        // 为指定 ID 的页面添加 'active' 类，使其显示
        document.getElementById(pageId).classList.add('active');
        // 更新当前页面 ID
        currentPage = pageId;
        localStorage.setItem('currentPageId', pageId); // 保存当前页面ID以便刷新后恢复

        // 更新头部标题和按钮状态
        const activeNavItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        // 如果目标页面对应一个导航项且不是动态页面 (如游戏详情页)
        if (activeNavItem && !isDynamicPage(pageId)) {
            pageTitle.textContent = activeNavItem.querySelector('span:last-child').textContent; // 设置页面标题为导航项的文本
            navItems.forEach(item => item.classList.remove('active')); // 移除所有导航项的 'active' 状态
            activeNavItem.classList.add('active'); // 设置当前导航项为 'active'
            backButton.style.display = 'none'; // 隐藏返回按钮
            saveButton.style.display = 'none'; // 隐藏保存按钮
            if (pageId === 'homePage' || pageId === 'libraryPage') { // 首页和游戏库显示搜索按钮
                if (searchBtn) searchBtn.style.display = 'inline-block';
            }
        } else if (isDynamicPage(pageId)) {
            // 如果是动态页面 (如游戏详情页)，它们会自己设置标题
            backButton.style.display = 'inline-block'; // 显示返回按钮
            if (searchBtn) searchBtn.style.display = 'none'; // 动态页面默认不显示搜索按钮
        } else {
             // 对于没有对应导航项的页面 (如果有的话)，设置默认标题
             pageTitle.textContent = "游戏记录器"; 
             backButton.style.display = 'none'; // 隐藏返回按钮
             saveButton.style.display = 'none'; // 隐藏保存按钮
             if (pageId === 'homePage' || pageId === 'libraryPage') { // 首页和游戏库显示搜索按钮
                if (searchBtn) searchBtn.style.display = 'inline-block';
             } else {
                if (searchBtn) searchBtn.style.display = 'none'; // 其他页面隐藏搜索按钮
             }
        }

        // 如果是添加游戏页面，则显示保存按钮并根据编辑状态更新UI
        if (pageId === 'addGamePage') {
            saveButton.style.display = 'inline-block';
            if (window.editingGameId) {
                pageTitle.textContent = '编辑游戏';
                saveButton.textContent = '更新游戏'; // 更新按钮文本为“更新游戏”
            } else {
                // 确保表单存在再重置
                if (addGameForm) {
                    addGameForm.reset(); 
                    if (coverPreview) coverPreview.src = 'https://via.placeholder.com/300x150.png?text=点击上传游戏封面图片'; 
                    if (progressValueSpan) progressValueSpan.textContent = '0%'; 
                }
                pageTitle.textContent = '添加游戏';
                saveButton.textContent = '保存游戏'; 
            }
        } else {
            // 对于非添加游戏页面，如果之前是编辑模式，则清除编辑状态
            // 确保在切换到非 addGamePage 时清除 editingGameId
            if (window.editingGameId) {
                window.editingGameId = null;
            }
        }

        // 根据页面ID设置特定标题和返回按钮状态
        if (pageId === 'platformManagementPage') {
            pageTitle.textContent = '游戏平台管理';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none'; // 平台管理页不显示搜索按钮
            if(searchInputContainer) searchInputContainer.style.display = 'none'; // 确保搜索框也隐藏
            renderPlatformList(); // 渲染平台列表
        } else if (pageId === 'customTagManagementPage') {
            pageTitle.textContent = '自定义游戏标签管理';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none'; // 标签管理页不显示搜索按钮
            if(searchInputContainer) searchInputContainer.style.display = 'none'; // 确保搜索框也隐藏
            renderCustomTagList(); // 渲染标签列表
        } else if (pageId === 'aboutPage') {
            pageTitle.textContent = '关于应用';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none'; // 关于页不显示搜索按钮
            if(searchInputContainer) searchInputContainer.style.display = 'none'; // 确保搜索框也隐藏
        } else if (pageId === 'helpFeedbackPage') {
            pageTitle.textContent = '帮助与反馈';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none'; // 帮助页不显示搜索按钮
            if(searchInputContainer) searchInputContainer.style.display = 'none'; // 确保搜索框也隐藏
        } else if (pageId === 'themeSettingsPage') {
            pageTitle.textContent = '主题设置';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none';
            if(searchInputContainer) searchInputContainer.style.display = 'none';
        } else if (pageId === 'languageSettingsPage') {
            pageTitle.textContent = '语言设置';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none';
            if(searchInputContainer) searchInputContainer.style.display = 'none';
        } else if (pageId === 'gameDataManagementPage') {
            pageTitle.textContent = '游戏数据管理';
            backButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            if(searchBtn) searchBtn.style.display = 'none';
            if(searchInputContainer) searchInputContainer.style.display = 'none';
        } else if (pageId === 'statsPage') {
            pageTitle.textContent = document.querySelector('.nav-item[data-page="statsPage"] span:last-child').textContent || '统计';
            backButton.style.display = 'none';
            saveButton.style.display = 'none';
            if (searchBtn) searchBtn.style.display = 'none'; // 统计页不显示搜索按钮
            if (searchInputContainer) searchInputContainer.style.display = 'none'; // 确保搜索框也隐藏
            if (typeof renderStatsPage === 'function') {
                renderStatsPage();
            } else {
                console.error('renderStatsPage function not found. Chart will not be displayed.');
            }
        }
    }

    // 判断页面是否为动态页面（目前只有游戏详情页是）
    function isDynamicPage(pageId) {
        return pageId.startsWith('gameDetails_'); // 假设游戏详情页ID以 'gameDetails_' 开头
    }

    // --- 搜索功能逻辑 ---
    searchBtn.addEventListener('click', () => {
        pageTitle.style.display = 'none';
        searchInputContainer.style.display = 'flex';
        appSearchInput.focus();
        // 如果当前不在搜索结果页，则不切换页面，允许在当前页搜索
    });

    closeSearchBtn.addEventListener('click', () => {
        searchInputContainer.style.display = 'none';
        pageTitle.style.display = 'block';
        appSearchInput.value = ''; // 清空搜索框
        if (currentPage === 'searchResultsPage') {
            showPage(previousPage || 'homePage', true); // 返回上一页或首页
        }
        // 清理搜索结果显示
        searchResultsContainer.innerHTML = '';
        noSearchResults.style.display = 'none';
    });

    appSearchInput.addEventListener('input', () => {
        const searchTerm = appSearchInput.value.trim().toLowerCase();
        if (!searchTerm) {
            searchResultsContainer.innerHTML = '';
            noSearchResults.style.display = 'none';
            if (currentPage === 'searchResultsPage') {
                 // 如果搜索框清空时仍在搜索结果页，可以考虑返回或显示提示
            }
            return;
        }

        const filteredGames = getGames().filter(game => 
            game.name.toLowerCase().includes(searchTerm) || 
            (game.developer && game.developer.toLowerCase().includes(searchTerm)) ||
            (game.type && game.type.toLowerCase().includes(searchTerm))
        );

        renderSearchResults(filteredGames);
        if (currentPage !== 'searchResultsPage') {
            showPage('searchResultsPage');
        }
    });

    function renderSearchResults(results) {
        searchResultsContainer.innerHTML = ''; // 清空现有结果
        if (results.length === 0) {
            noSearchResults.style.display = 'block';
            return;
        }
        noSearchResults.style.display = 'none';

        results.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.classList.add('home-game-card'); // 复用首页卡片样式
            gameCard.dataset.gameId = game.id; // 用于可能的点击事件

            const coverImg = document.createElement('img');
            coverImg.src = game.cover || 'https://via.placeholder.com/300x450.png?text=No+Cover';
            coverImg.alt = game.name;

            const gameName = document.createElement('h5');
            gameName.textContent = game.name;

            const gameRatingStars = document.createElement('div');
            gameRatingStars.classList.add('rating-stars');
            const rating = game.rating ? Math.round(parseFloat(game.rating) / 2) : 0; // 将10分制转为5星
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.innerHTML = i <= rating ? '★' : '☆';
                gameRatingStars.appendChild(star);
            }

            gameCard.appendChild(coverImg);
            gameCard.appendChild(gameName);
            gameCard.appendChild(gameRatingStars);
            
            // 添加点击事件，跳转到游戏详情页 (如果详情页逻辑已实现)
            gameCard.addEventListener('click', () => {
                // 假设有 renderGameDetailsPage(game.id) 或类似函数
                // console.log('Clicked game:', game.id);
                // showGameDetails(game.id); // 你需要实现这个函数或类似的导航逻辑
                showGameDetails(game.id);
            });

            searchResultsContainer.appendChild(gameCard);
        });
    }

    // 修改 showPage 以处理搜索框的显示状态
    // 将原始的 showPage 函数保存到一个不同的变量名，避免在重写时产生混淆
    const _originalShowPage = showPage;
    // 重写全局的 showPage 函数，以便在切换页面时可以自动处理搜索框的显示/隐藏
    window.showPage = function(pageId, isBack = false) {
        // 如果搜索输入框当前是可见的，并且目标页面不是搜索结果页本身
        if (searchInputContainer && searchInputContainer.style.display === 'flex' && pageId !== 'searchResultsPage') {
            // 模拟点击关闭搜索按钮的行为，以隐藏搜索框并重置相关状态
            if(closeSearchBtn) closeSearchBtn.click(); 
        }
        // 调用原始的页面切换函数
        _originalShowPage(pageId, isBack);
    };

    // --- 平台管理逻辑 ---
    function renderPlatformList() {
        if (!platformList) return;
        platformList.innerHTML = '';
        getPlatforms().forEach((platform, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = platform;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.classList.add('delete-item-btn');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // 阻止事件冒泡到li
                if (confirm(`确定要删除平台 "${platform}" 吗？`)){
                    const updatedPlatforms = getPlatforms().filter((_, i) => i !== index);
                    setPlatforms(updatedPlatforms);
                    savePlatforms();
                    renderPlatformList();
                    populateGamePlatformSelect(); // 更新添加游戏页的下拉列表
                    // 注意：如果平台被删除，可能需要处理已使用该平台的游戏数据
                }
            });
            listItem.appendChild(deleteBtn);
            platformList.appendChild(listItem);
        });
    }

    if (addPlatformBtn) {
        addPlatformBtn.addEventListener('click', () => {
            const newPlatform = newPlatformInput.value.trim();
            const currentPlatforms = getPlatforms();
            if (newPlatform && !currentPlatforms.includes(newPlatform)) {
                const updatedPlatforms = [...currentPlatforms, newPlatform].sort((a, b) => a.localeCompare(b));
                setPlatforms(updatedPlatforms);
                savePlatforms();
                renderPlatformList();
                populateGamePlatformSelect();
                newPlatformInput.value = '';
            } else if (currentPlatforms.includes(newPlatform)){
                alert('该平台已存在！');
            } else {
                alert('平台名称不能为空！');
            }
        });
    }

    function populateGamePlatformSelect() {
        if (!gamePlatformSelect) return;
        const currentPlatformValue = gamePlatformSelect.value; // 保存当前选中的值
        gamePlatformSelect.innerHTML = '<option value="">选择平台</option>'; // 添加一个默认的空选项
        getPlatforms().forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            gamePlatformSelect.appendChild(option);
        });
        // 尝试恢复之前选中的值
        if (getPlatforms().includes(currentPlatformValue)) {
            gamePlatformSelect.value = currentPlatformValue;
        } else {
            gamePlatformSelect.value = ""; // 如果之前的平台不存在了，则选中默认空选项
        }
    }

    // --- 自定义标签管理逻辑 ---
    function renderCustomTagList() {
        if (!customTagList) return;
        customTagList.innerHTML = '';
        getCustomTags().forEach((tag, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = tag;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.classList.add('delete-item-btn');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm(`确定要删除标签 "${tag}" 吗？`)){
                    const updatedCustomTags = getCustomTags().filter((_, i) => i !== index);
                    setCustomTags(updatedCustomTags);
                    saveCustomTags();
                    renderCustomTagList();
                    populateGameTypeSelect(); // 更新添加游戏页的下拉列表
                    populateHomeFilters(); // 更新首页筛选器
                    populateTagFilter(); // 更新库页筛选器
                     // 注意：如果标签被删除，可能需要处理已使用该标签的游戏数据
                }
            });
            listItem.appendChild(deleteBtn);
            customTagList.appendChild(listItem);
        });
    }

    if (addCustomTagBtn) {
        addCustomTagBtn.addEventListener('click', () => {
            const newTag = newCustomTagInput.value.trim();
            const currentCustomTags = getCustomTags();
            if (newTag && !currentCustomTags.includes(newTag)) {
                const updatedCustomTags = [...currentCustomTags, newTag].sort((a, b) => a.localeCompare(b));
                setCustomTags(updatedCustomTags);
                saveCustomTags();
                renderCustomTagList();
                populateGameTypeSelect();
                populateHomeFilters();
                populateTagFilter(); 
                newCustomTagInput.value = '';
            } else if (currentCustomTags.includes(newTag)){
                alert('该标签已存在！');
            } else {
                alert('标签名称不能为空！');
            }
        });
    }
    // populateGameTypeSelect 已在之前定义和使用，用于填充添加游戏页的类型选择
    // populateHomeFilters 和 populateTagFilter 也已定义

    /**
     * 显示指定游戏ID的游戏详情页面。
     * @param {string} gameId - 要显示详情的游戏ID。
     */
    function showGameDetails(gameId) {
        const game = getGames().find(g => g.id === gameId);
        if (!game) {
            console.error('Game not found:', gameId);
            return;
        }

        const gameDetailsPage = document.getElementById('gameDetailsPage');
        if (!gameDetailsPage) {
            console.error('gameDetailsPage element not found!');
            return;
        }

        // 更新页面标题
        pageTitle.textContent = '游戏记录器';

        // 填充游戏详情
        document.getElementById('detailGameCover').src = game.cover || 'https://via.placeholder.com/300x150.png?text=No+Cover';
        document.getElementById('detailGameName').textContent = game.name;
        document.getElementById('detailReleaseDate').textContent = game.releaseDate || '未知';
        document.getElementById('detailDeveloper').textContent = game.developer || '未知';
        document.getElementById('detailPlatform').textContent = game.platform || '未知';
        document.getElementById('detailRating').innerHTML = generateStarRating(game.rating);
        document.getElementById('detailProgress').textContent = `${game.progress || 0}%`;
        document.getElementById('detailPlaytime').textContent = `${game.playtime || 0} 小时`;
        document.getElementById('detailDescription').textContent = game.description || '暂无简介。';
        // document.getElementById('detailPlayRecords').textContent = game.playRecords || '暂无游玩记录。'; // 改为调用 renderPlayRecords
        renderPlayRecords(gameId); // 渲染游玩记录

        // “记录游玩”按钮逻辑
        const logPlayBtn = document.getElementById('logPlayBtn');
        if (logPlayBtn) {
            logPlayBtn.onclick = () => {
                // 这里可以弹出一个模态框或导航到新的表单页面来记录游玩信息
                // 为了简单起见，我们先弹出一个 prompt
                const playDate = prompt("请输入游玩日期 (YYYY-MM-DD):", new Date().toISOString().slice(0,10));
                if (!playDate) return; // 用户取消

                const playDuration = prompt("请输入本次游玩时长 (小时):");
                if (!playDuration || isNaN(parseFloat(playDuration))) {
                    alert("请输入有效的游玩时长！");
                    return;
                }

                const playNotes = prompt("请输入游玩备注 (可选):");

                const newRecord = {
                    date: playDate,
                    duration: parseFloat(playDuration),
                    notes: playNotes || ''
                };

                const games = getGames();
                const gameIndex = games.findIndex(g => g.id === gameId);
                if (gameIndex !== -1) {
                    if (!games[gameIndex].playRecords || !Array.isArray(games[gameIndex].playRecords)) {
                        games[gameIndex].playRecords = [];
                    }
                    games[gameIndex].playRecords.push(newRecord);
                    // 更新总游玩时长
                    games[gameIndex].playtime = (parseFloat(games[gameIndex].playtime) || 0) + parseFloat(playDuration);
                    setGames(games);
                    saveGames();
                    // 重新渲染游玩记录和游玩时长
                    renderPlayRecords(gameId);
                    document.getElementById('detailPlaytime').textContent = `${games[gameIndex].playtime || 0} 小时`;
                    alert('游玩记录已添加！');
                } else {
                    alert('未找到游戏，无法记录。');
                }
            };
        }

        // 设置编辑按钮的点击事件
        const editGameBtn = document.getElementById('editGameBtn');
        if (editGameBtn) {
            editGameBtn.onclick = () => {
                window.editingGameId = game.id; // 设置当前正在编辑的游戏ID
                showPage('addGamePage'); // 跳转到添加/编辑游戏页面
                // 填充表单数据
                document.getElementById('gameName').value = game.name;
                document.getElementById('releaseDate').value = game.releaseDate || ''; // 使用 index.html 中的 ID
                document.getElementById('developer').value = game.developer || ''; // 使用 index.html 中的 ID
                document.getElementById('gamePlatform').value = game.platform;
                document.getElementById('gameProgress').value = game.progress || 0;
                document.getElementById('progressValue').textContent = `${game.progress || 0}%`;
                document.getElementById('playTime').value = game.playTime || 0; // 使用 index.html 中的 ID, 注意大小写
                document.getElementById('gameSummary').value = game.summary || ''; // 使用 index.html 中的 ID (gameSummary 对应 description)
                // document.getElementById('gamePlayRecords').value = game.playRecords; // addGamePage 中没有 gamePlayRecords 字段
                document.getElementById('gameCover').value = ''; // 文件输入框不能直接设置值，需要用户重新选择
                document.getElementById('coverPreview').src = game.cover || 'https://via.placeholder.com/300x150.png?text=点击上传游戏封面图片';
                document.getElementById('gameTypeSelect').value = game.type || '';
                document.getElementById('gameRating').value = game.rating || '';
            };
        }

        // 显示游戏详情页面
        showPage('gameDetailsPage');
    }

    /**
     * 渲染指定游戏的游玩记录到详情页面。
     * @param {string} gameId - 游戏ID。
     */
    function renderPlayRecords(gameId) {
        const game = getGames().find(g => g.id === gameId);
        const playRecordsContainer = document.getElementById('detailPlayRecordsList'); // 假设HTML中有一个ul或div用于显示列表
        if (!game || !playRecordsContainer) {
            if(playRecordsContainer) playRecordsContainer.innerHTML = '<li>暂无游玩记录。</li>';
            return;
        }

        playRecordsContainer.innerHTML = ''; // 清空旧记录

        if (!game.playRecords || game.playRecords.length === 0) {
            playRecordsContainer.innerHTML = '<li>暂无游玩记录。</li>';
        } else {
            // 对游玩记录按日期降序排序
            const sortedRecords = [...game.playRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedRecords.forEach(record => {
                const listItem = document.createElement('li');
                listItem.classList.add('play-record-item');
                listItem.innerHTML = `
                    <strong>日期:</strong> ${record.date}<br>
                    <strong>时长:</strong> ${record.duration} 小时<br>
                    <strong>备注:</strong> ${record.notes || '无'}
                `;
                playRecordsContainer.appendChild(listItem);
            });
        }
    }

    /**
     * 根据评分生成星级HTML字符串。
     * @param {number} rating - 游戏评分 (0-10)。
     * @returns {string} 包含星级图标的HTML字符串。
     */
    function generateStarRating(rating) {
        const roundedRating = rating ? Math.round(parseFloat(rating) / 2) : 0; // 将10分制转为5星
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span class="${i <= roundedRating ? 'rated' : ''}">★</span>`;
        }
        return starsHtml;
    }

    // 为每个导航项添加点击事件监听器
    navItems.forEach(item => {
        let touchmoved = false;
        item.addEventListener('touchstart', () => {
            touchmoved = false;
        }, { passive: true });

        item.addEventListener('touchmove', () => {
            touchmoved = true;
        }, { passive: true });

        const handleClickOrTouch = (event) => {
            // 首先阻止默认行为，以避免在任何情况下发生意外的导航或操作
            event.preventDefault(); 

            // 如果是 touchend 事件并且检测到了滑动，则判定为滑动操作，不执行页面跳转
            if (event.type === 'touchend' && touchmoved) {
                return; // 滑动时不执行后续操作
            }

            // 对于非滑动结束的 touchend 事件或 click 事件，执行页面跳转逻辑
            const pageId = item.getAttribute('data-page'); 
            if (pageId === 'addGamePage') {
                window.editingGameId = null; 
            }
            showPage(pageId); 
        };

        item.addEventListener('touchend', handleClickOrTouch);
        item.addEventListener('click', handleClickOrTouch); // 保留 click 事件以兼容桌面端和非触摸设备
    });

    // 为返回按钮添加点击事件监听器
    backButton.addEventListener('click', () => {
        if (previousPage) { // 如果存在前一个页面记录
            showPage(previousPage, true); // 显示前一个页面，并标记为返回操作
            previousPage = null; // 返回后重置前一个页面记录
        }
    });
    // 为保存按钮添加点击事件监听器
    saveButton.addEventListener('click', () => {
        if (currentPage === 'addGamePage') { // 如果当前是添加游戏页面
            addGameForm.dispatchEvent(new Event('submit')); // 手动触发表单的 submit 事件
        }
        // 如果其他页面也需要保存操作，可以在此添加逻辑
    });

    // --- 添加游戏页面逻辑 ---
    // 如果游戏进度输入滑块存在
    if (gameProgressInput) {
        // 为其添加 'input' 事件监听器，当滑块值改变时更新进度显示
        gameProgressInput.addEventListener('input', () => {
            progressValueSpan.textContent = `${gameProgressInput.value}%`;
        });
    }

    // 如果游戏封面图片文件输入框、预览元素存在且监听器尚未附加
    if (gameCoverInput && coverPreview && !isCoverInputListenerAttached) {
        // 为其添加 'change' 事件监听器，当选择文件后触发
        gameCoverInput.addEventListener('change', function(event) { // 使用 function 关键字定义回调
            const file = event.target.files[0]; // 获取选择的第一个文件
            if (file && file.type.startsWith('image/')) { // 确保是图片文件
                const reader = new FileReader(); // 创建 FileReader 对象以读取文件内容
                reader.onload = (e) => { // 文件读取成功完成时触发
                    const img = new Image(); // 创建 Image 对象
                    img.onload = () => { // 图片加载完成时触发（用于获取图片原始尺寸）
                        const canvas = document.createElement('canvas'); // 创建 Canvas 用于图片压缩
                        const MAX_WIDTH = 800; // 定义压缩后的最大宽度
                        const MAX_HEIGHT = 600; // 定义压缩后的最大高度
                        let width = img.width;
                        let height = img.height;

                        // 按比例调整图片尺寸
                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height); // 在canvas上绘制调整尺寸后的图片
                        
                        // 获取压缩后的图片数据 (例如，以JPEG格式，质量为0.7)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        coverPreview.src = dataUrl; // 更新封面预览的 src 为压缩后的图片
                    };
                    img.onerror = function() { // 添加图片加载错误处理
                        alert('图片加载失败，请检查文件格式或网络。');
                    };
                    img.src = e.target.result; // 设置 Image 对象的 src 为读取的文件数据，以触发其 onload 事件
                };
                reader.onerror = function() { // 添加文件读取错误处理
                    alert('文件读取失败。');
                };
                reader.readAsDataURL(file); // 开始读取文件内容
                // 关键: 在文件开始处理后，重置input的值，以便下次选择相同文件仍能触发change事件
                event.target.value = null;
            } else if (file && !file.type.startsWith('image/')){ // 如果选择了文件但不是图片
                alert('请选择有效的图片文件 (例如 JPG, PNG, GIF)。');
                event.target.value = null; // 清空选择，以便用户可以重新选择
            } else { // 用户取消选择或未选择文件 (file is null or undefined)
                event.target.value = null; // 清空input的值
            }
        });
        isCoverInputListenerAttached = true; // 标记监听器已附加
    }

    // 这段代码保持不变，因为它在 if (gameCoverInput) 块之外，并且是针对不同的逻辑
    if (gameProgressInput) {
        // 为其添加 'input' 事件监听器，当滑块值改变时更新进度显示
        gameProgressInput.addEventListener('input', () => {
            progressValueSpan.textContent = `${gameProgressInput.value}%`;
        });
    }

    // 将原有的 if (gameCoverInput) 块内的其他逻辑（如果有的话）移到这里，
    // 或者确保它们在新的 if (gameCoverInput && coverPreview && !isCoverInputListenerAttached) 块之外正确处理。
    // 从您提供的代码片段看，原 if (gameCoverInput) 块内只有事件监听器。
    // 因此，下面的代码块是多余的，因为事件监听器已经被移到新的条件块中。
    // 我将删除这个多余的、空的 if (gameCoverInput) 块。
    // if (gameCoverInput) {
    // }


    // 如果游戏进度输入滑块存在
    if (gameProgressInput) {
        // 为游戏进度滑块添加 'input' 事件监听器，当用户拖动滑块时更新进度值显示
        gameProgressInput.addEventListener('input', () => {
            progressValueSpan.textContent = `${gameProgressInput.value}%`;
        });
    }
    // 如果封面预览元素存在
    if (coverPreview) {
        // 为其父元素（通常是一个容器）添加点击事件，点击时触发文件输入框的 click 事件，从而打开文件选择对话框
        coverPreview.parentElement.addEventListener('click', () => gameCoverInput.click());
    }

    // 如果添加游戏表单存在
    if (addGameForm) {
        // 为其添加 'submit' 事件监听器
        addGameForm.addEventListener('submit', (event) => {
            event.preventDefault(); // 阻止表单的默认提交行为

            const gameName = document.getElementById('gameName').value.trim();
            if (!gameName) {
                alert('游戏名称不能为空！');
                return;
            }

            // 创建一个新的游戏对象，从表单字段中获取值
            const currentGames = getGames();
            const newGame = {
                id: window.editingGameId || Date.now().toString(), // 如果是编辑模式，则使用现有 ID，否则生成新的时间戳 ID
                name: gameName, // 游戏名称
                platform: document.getElementById('gamePlatform').value, // 游戏平台
                type: gameTypeSelect.value, // 从 select 获取游戏类型 (单选)
                releaseDate: document.getElementById('releaseDate').value, // 发行日期
                developer: document.getElementById('developer').value, // 开发商
                rating: parseFloat(document.getElementById('gameRating').value) || null, // 游戏评分 (转为浮点数，无效则为 null)
                status: document.getElementById('gameStatus').value, // 游戏状态
                progress: parseInt(document.getElementById('gameProgress').value), // 游戏进度 (转为整数)
                playTime: parseInt(document.getElementById('playTime').value) || 0, // 游玩时长 (转为整数，无效则为 0)
                summary: document.getElementById('gameSummary').value, // 游戏简介
                cover: coverPreview.src.startsWith('data:image') ? coverPreview.src : 'https://via.placeholder.com/300x150.png?text=No+Cover', // 游戏封面 (如果是 Data URL 则使用，否则用占位图)
                playLog: window.editingGameId ? currentGames.find(g => g.id === window.editingGameId).playLog : [] // 游玩记录 (编辑时保留旧记录，新增时为空数组)
            };

            let updatedGames;
            if (window.editingGameId) { // If editing
                updatedGames = getGames().map(g => (g.id === window.editingGameId ? newGame : g));
            } else {
                updatedGames = [...getGames(), newGame];
            }
            setGames(updatedGames);
            saveGames();
            
            // Cache cover image via Service Worker if it's a new Data URL
            if (newGame.cover.startsWith('data:image') && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CACHE_IMAGE_DATA_URL',
                    id: newGame.id, // Use game ID to create a unique cache key
                    dataUrl: newGame.cover
                });
            }

            saveGames();
            populateHomeFilters(); // 更新首页筛选器选项
            
            // Save new tag if it's not already in customTags
            const newType = newGame.type;
            const currentCustomTags = getCustomTags();
            if (newType && !currentCustomTags.includes(newType)) {
                const updatedCustomTags = [...currentCustomTags, newType];
                setCustomTags(updatedCustomTags);
                saveCustomTags();
                populateGameTypeSelect(); // Re-populate select if new tag was added
                populateTagFilter(); // Re-populate filter if new tag was added
            }

            const successMessage = window.editingGameId ? '游戏已更新!' : '游戏已添加!';
            window.editingGameId = null; // Clear editing ID *before* resetting form and navigating

            alert(successMessage);
            addGameForm.reset();
            coverPreview.src = 'https://via.placeholder.com/300x150.png?text=点击上传游戏封面图片';
            progressValueSpan.textContent = '0%';
            gameTypeSelect.value = ''; // Reset select
            
            showPage('libraryPage'); 
            renderLibraryPage(); 
            applyHomeFiltersAndRender(); // 重新渲染主页并应用筛选
            renderStatsPage(); // Also render stats page
        });
    }

    // --- Game Type Select Logic ---

    // --- Game Type Select Logic ---
    function populateGameTypeSelect() {
        if (!gameTypeSelect) return;
        gameTypeSelect.innerHTML = ''; // Clear existing options
        getCustomTags().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            gameTypeSelect.appendChild(option);
        });
    }
    populateGameTypeSelect(); // Initial population

    // --- Search and Filter Logic ---
    const searchInput = document.getElementById('searchInput');
    const platformFilter = document.getElementById('platformFilter');
    const statusFilter = document.getElementById('statusFilter');
    const tagFilter = document.getElementById('tagFilter');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');

    function populateTagFilter() {
        if (!tagFilter) return;
        tagFilter.innerHTML = '<option value="">所有标签</option>'; // Reset
        getCustomTags().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedPlatform = platformFilter.value;
        const selectedStatus = statusFilter.value;
        const selectedTag = tagFilter.value;

        let filteredGames = getGames().filter(game => {
            const nameMatch = game.name.toLowerCase().includes(searchTerm);
            const platformMatch = !selectedPlatform || game.platform === selectedPlatform;
            const statusMatch = !selectedStatus || game.status === selectedStatus;
            const tagMatch = !selectedTag || (game.type && game.type === selectedTag); // game.type is now a string
            return nameMatch && platformMatch && statusMatch && tagMatch;
        });
        renderLibraryPage(filteredGames); // Pass filtered games to render
    }

    function resetFilters() {
        searchInput.value = '';
        platformFilter.value = '';
        statusFilter.value = '';
        tagFilter.value = '';
        renderLibraryPage(); // Render all games
    }

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilters);
    }
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilters);
    }
    // Apply filters on input change for immediate feedback (optional)
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (platformFilter) platformFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (tagFilter) tagFilter.addEventListener('change', applyFilters);

    // --- 游戏库页面逻辑 ---
    // 渲染游戏库页面
    // gamesToRender: (可选) 要渲染的游戏数组，默认为全部游戏 (games)
    function renderLibraryPage(gamesToRender = getGames()) { 
        const libraryPage = document.getElementById('libraryPage'); // 获取游戏库页面的 DOM 元素
        if (!libraryPage) return; // 如果页面元素不存在，则直接返回

        // 获取游戏列表容器
        const gameGridContainer = document.getElementById('libraryGameGrid');
        if (!gameGridContainer) return; // 如果容器元素不存在，则直接返回
        gameGridContainer.innerHTML = ''; // 清空容器中之前的内容

        // 防御性检查，确保 gamesToRender 是一个数组
        if (!Array.isArray(gamesToRender)) {
            console.error('renderLibraryPage: gamesToRender is not an array! Received:', gamesToRender);
            // 尝试回退到所有游戏；如果 getGames() 也返回非数组，则显示错误
            gamesToRender = getGames(); 
            if (!Array.isArray(gamesToRender)) {
                console.error('renderLibraryPage: Fallback getGames() also did not return an array!');
                gameGridContainer.innerHTML = '<p>加载游戏数据时出错，请稍后重试或联系支持。</p>';
                return;
            }
        }

        if (gamesToRender.length === 0) { // 如果没有游戏可供渲染
            gameGridContainer.innerHTML = '<p>游戏库是空的。尝试添加一些游戏吧！</p>'; // 显示提示信息
        } else { // 如果有游戏
            gamesToRender.forEach(game => { // 遍历每个游戏对象
                const gameCard = document.createElement('div'); // 为每个游戏创建一个 div 元素作为卡片
                gameCard.classList.add('library-game-card'); // 添加游戏库卡片样式
                gameCard.dataset.gameId = game.id; // 用于可能的点击事件

                const coverImg = document.createElement('img');
                coverImg.classList.add('game-cover'); // Add class for styling
                coverImg.src = game.cover || 'https://via.placeholder.com/120x90.png?text=No+Cover'; // Adjusted placeholder size
                coverImg.alt = game.name;

                const gameInfoContent = document.createElement('div');
                gameInfoContent.classList.add('game-info-content');

                const gameName = document.createElement('h5');
                gameName.classList.add('game-name'); // Add class for styling
                gameName.textContent = game.name;

                const gameDetails = document.createElement('p');
                gameDetails.classList.add('game-details'); // Add class for styling
                gameDetails.textContent = `平台: ${game.platform} | 类型: ${game.type || 'N/A'} | 进度: ${game.progress}%`;

                const gameRatingStars = document.createElement('div');
                gameRatingStars.classList.add('rating-stars');
                // Display stars based on rating
                const fullStars = Math.floor(game.rating);
                const emptyStars = 5 - fullStars;
                let starsHtml = '';
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += '<span class="star"></span>';
                }
                for (let i = 0; i < emptyStars; i++) {
                    starsHtml += '<span class="star empty"></span>';
                }
                gameRatingStars.innerHTML = starsHtml || '未评分';

                gameInfoContent.appendChild(gameName);
                gameInfoContent.appendChild(gameDetails);
                gameInfoContent.appendChild(gameRatingStars);

                gameCard.appendChild(coverImg);
                gameCard.appendChild(gameInfoContent);
                
                // 添加点击事件，跳转到游戏详情页
                gameCard.addEventListener('click', () => {
                    showGameDetails(game.id);
                });

                gameGridContainer.appendChild(gameCard); // 将卡片添加到游戏网格容器中
            });
        }


        // 为游戏库中的删除按钮添加事件监听器
        document.querySelectorAll('.delete-library-game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡到父元素（game-list-item）的点击事件
                const gameId = e.target.dataset.gameId;
                const currentGames = getGames();
                const gameIndex = currentGames.findIndex(g => g.id === gameId);
                if (gameIndex !== -1) {
                    if (confirm(`确定要删除游戏 "${currentGames[gameIndex].name}" 吗？此操作无法撤销。`)) {
                        const updatedGames = currentGames.filter((_, i) => i !== gameIndex);
                        setGames(updatedGames);
                        saveGames(); // 保存更新后的游戏数据
                        renderLibraryPage(); // 重新渲染游戏库页面
                        renderGameDataManagementPage(); // 更新游戏数据管理页面
                        renderStatsPage(); // 更新统计视图
                        renderHomePage(); // 更新主页视图
                        alert('游戏已删除。');
                    }
                }
            });
        });
    }

    // --- 游戏详情页面逻辑 ---
    // 显示指定 ID 的游戏详情页面
    function showGameDetailPage(gameId) {
        const game = getGames().find(g => g.id === gameId); // 从游戏列表中查找具有指定 ID 的游戏
        if (!game) return; // 如果未找到游戏，则直接返回

        // 更新详情页面中各个元素的内容，以显示游戏信息
        document.getElementById('detailCover').src = game.cover || 'https://via.placeholder.com/400x200.png?text=No+Cover'; // 游戏封面，若无则显示占位图
        document.getElementById('detailName').textContent = game.name; // 游戏名称
        pageTitle.textContent = game.name; // 将页面标题也设置为游戏名称
        document.getElementById('detailTags').innerHTML = game.type ? `<span class="tag">${game.type}</span>` : '无类型'; // 游戏类型标签 (string)
        document.getElementById('detailReleaseDate').textContent = game.releaseDate || '未知'; // 发行日期，若无则显示“未知”
        document.getElementById('detailDeveloper').textContent = game.developer || '未知'; // 开发商，若无则显示“未知”
        document.getElementById('detailPlatform').textContent = game.platform || '未知'; // 游戏平台，若无则显示“未知”
        document.getElementById('detailRating').textContent = game.rating ? game.rating.toFixed(1) : '未评分'; // 游戏评分，保留一位小数，若无则显示“未评分”
        document.getElementById('detailProgressBar').style.width = `${game.progress}%`; // 游戏进度条宽度
        document.getElementById('detailProgress').textContent = game.progress; // 游戏进度百分比
        document.getElementById('detailPlayTime').textContent = game.playTime; // 游玩时长
        document.getElementById('detailSummary').textContent = game.summary || '暂无简介。'; // 游戏简介，若无则显示“暂无简介。”

        // 渲染游玩记录
        const playLogContainer = document.getElementById('playLogContainer'); // 获取游玩记录容器
        playLogContainer.innerHTML = ''; // 清空旧的游玩记录
        if (game.playLog && game.playLog.length > 0) { // 如果存在游玩记录
            game.playLog.forEach(log => { // 遍历每条记录
                const logEntry = document.createElement('div'); // 创建一个 div 元素作为记录项
                logEntry.className = 'log-item'; // 添加样式类
                // 设置记录项的 HTML 内容，包括日期、时长和备注
                logEntry.innerHTML = `<strong>${new Date(log.date).toLocaleDateString()}:</strong> ${log.duration}小时 - ${log.notes}`;
                playLogContainer.appendChild(logEntry); // 将记录项添加到容器中
            });
        } else { // 如果没有游玩记录
            playLogContainer.innerHTML = '<p>暂无游玩记录。</p>'; // 显示提示信息
        }
        // “编辑游戏”按钮逻辑
        const editGameBtn = document.getElementById('editGameBtn'); // 获取编辑按钮
        editGameBtn.onclick = () => { // 设置按钮的点击事件处理函数
            window.editingGameId = game.id; // 设置全局变量，标记当前正在编辑的游戏 ID
            pageTitle.textContent = '编辑游戏'; // 将页面标题更改为“编辑游戏”
            // 使用当前游戏的数据填充“添加/编辑游戏”表单
            document.getElementById('gameName').value = game.name;
            document.getElementById('gamePlatform').value = game.platform;
            // Set selected option in gameTypeSelect
            gameTypeSelect.value = game.type || ''; // game.type is now a string
            document.getElementById('releaseDate').value = game.releaseDate;

            document.getElementById('developer').value = game.developer;
            document.getElementById('gameRating').value = game.rating || '';
            document.getElementById('gameStatus').value = game.status;
            document.getElementById('gameProgress').value = game.progress;
            progressValueSpan.textContent = `${game.progress}%`;
            document.getElementById('playTime').value = game.playTime;
            document.getElementById('gameSummary').value = game.summary;
            coverPreview.src = game.cover; // 设置封面预览
            showPage('addGamePage'); // 显示“添加/编辑游戏”页面
        };

        // “记录游玩”按钮逻辑
        const logPlayBtn = document.getElementById('logPlayBtn'); // 获取记录游玩按钮
        logPlayBtn.onclick = () => { // 设置按钮的点击事件处理函数
            // 弹出对话框让用户输入游玩时长
            const duration = prompt("请输入本次游玩时长（小时）:", "1");
            // 验证输入是否有效
            if (duration === null || isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
                alert("请输入有效的游玩时长。");
                return;
            }
            // 弹出对话框让用户输入备注
            const notes = prompt("请输入本次游玩备注:", "继续主线剧情");

            // 将新的游玩记录添加到游戏的 playLog 数组中
            game.playLog.push({
                date: new Date().toISOString(), // 当前日期和时间 (ISO 格式)
                duration: parseFloat(duration), // 游玩时长 (转换为数字)
                notes: notes || "" // 备注，如果用户未输入则为空字符串
            });
            // 更新总游玩时长
            game.playTime = (parseFloat(game.playTime) + parseFloat(duration)).toFixed(1);
            // （可选）如果需要，可以在此处更新游戏进度
            saveGames(); // 保存更新后的游戏数据
            showGameDetailPage(game.id); // 刷新游戏详情页面以显示新记录
            alert("游玩记录已添加！"); // 提示用户记录已添加
        };

        showPage('gameDetailPage'); // 显示游戏详情页面
    }
    
    // --- 统计页面逻辑 ---
    function renderStatsPage() {
        const currentGames = getGames();
        // 计算各平台游戏数量
        const psCount = currentGames.filter(g => g.platform === 'PlayStation').length;
        const xboxCount = currentGames.filter(g => g.platform === 'Xbox').length;
        const switchCount = currentGames.filter(g => g.platform === 'Nintendo Switch').length;
        const pcCount = currentGames.filter(g => g.platform === 'PC').length;

        // 更新页面上显示的平台游戏数量
        document.getElementById('psCount').textContent = psCount;
        document.getElementById('xboxCount').textContent = xboxCount;
        document.getElementById('switchCount').textContent = switchCount;
        document.getElementById('pcCount').textContent = pcCount;

        // 计算各状态游戏数量
        const statusInProgress = currentGames.filter(g => g.status === '进行中').length;
        const statusCompleted = currentGames.filter(g => g.status === '已完成').length;
        const statusPaused = currentGames.filter(g => g.status === '已暂停').length;
        const statusAbandoned = currentGames.filter(g => g.status === '已放弃').length;
        const statusPlanned = currentGames.filter(g => g.status === '计划中').length;

        // 更新页面上显示的各状态游戏数量
        document.getElementById('statusInProgress').textContent = statusInProgress;
        document.getElementById('statusCompleted').textContent = statusCompleted;
        document.getElementById('statusPaused').textContent = statusPaused;
        document.getElementById('statusAbandoned').textContent = statusAbandoned;
        document.getElementById('statusPlanned').textContent = statusPlanned;

        // --- 游玩时长统计 --- 
        let totalPlayTime = 0;
        currentGames.forEach(game => {
            if (game.playTime && !isNaN(parseFloat(game.playTime))) {
                totalPlayTime += parseFloat(game.playTime);
            }
        });

        // 更新总游玩时长 (假设 index.html 中有一个 id 为 'totalPlayTimeValue' 的元素)
        // 如果没有总时长的显示元素，可以考虑添加一个，或者根据UI设计调整
        // console.log(`总游玩时长: ${totalPlayTime.toFixed(1)} 小时`); 

        // 更新周、月、季度、年的游玩时长
        // 注意：以下实现是基于当前数据结构的简化版本。
        // 准确的按时间段统计需要每个游戏有详细的游玩记录 (playLog) 包含日期和时长。
        // 目前，我们将简单地将总时长作为示例，或者在没有 playLog 的情况下显示为0。
        document.getElementById('timeWeekly').textContent = '0小时'; // 示例：需要 playLog 实现
        document.getElementById('timeMonthly').textContent = '0小时'; // 示例：需要 playLog 实现
        document.getElementById('timeQuarterly').textContent = '0小时'; // 示例：需要 playLog 实现
        document.getElementById('timeYearly').textContent = '0小时'; // 示例：需要 playLog 实现

        // 如果 games 数组为空，所有时长都应为0
        if (currentGames.length === 0) {
            document.getElementById('timeWeekly').textContent = '0小时';
            document.getElementById('timeMonthly').textContent = '0小时';
            document.getElementById('timeQuarterly').textContent = '0小时';
            document.getElementById('timeYearly').textContent = '0小时';
            // 如果有总时长显示元素，也设置为0
            // document.getElementById('totalPlayTimeValue').textContent = '0小时'; 
        } else {
            // 临时将总时长显示在“今年”作为占位，实际应按年份过滤
            // document.getElementById('playTimeStatsYear').textContent = `${totalPlayTime.toFixed(1)}小时`;
            // 更合适的做法是，如果无法按时间段统计，则明确告知用户或显示总时长
            // 例如，可以新增一个“总游玩时长”的显示项
        }
        
        // 游戏类型分布图表 (如果未使用 Chart.js，则为占位符)
        const genreCounts = {}; // 用于存储每种类型的游戏数量
        currentGames.forEach(game => {
            if (game.type) { // game.type is now a string
                genreCounts[game.type] = (genreCounts[game.type] || 0) + 1;
            }
        });
        const genreChartPlaceholder = document.getElementById('genreChartPlaceholder'); // 获取图表占位符元素
        // genreChartPlaceholder.innerHTML = '<h4>游戏类型分布 (示例)</h4>'; // 设置占位符标题
        // for (const genre in genreCounts) { // 遍历类型计数并显示
        //     const p = document.createElement('p');
        //     p.textContent = `${genre}: ${genreCounts[genre]}`;
        //     genreChartPlaceholder.appendChild(p);
        // }

        // 使用 Chart.js 实现实际的图表渲染
        const genreChartCtx = document.getElementById('genreDistributionChart'); // 获取图表 canvas 元素
        if (genreChartCtx) { // 检查 canvas 元素是否存在
            if (window.genreChartInstance) { // 如果已存在图表实例，则销毁它以避免重复渲染
                window.genreChartInstance.destroy();
            }
            const labels = Object.keys(genreCounts); // 获取类型名称作为标签
            const data = Object.values(genreCounts); // 获取类型数量作为数据
            window.genreChartInstance = new Chart(genreChartCtx, { // 创建新的 Chart.js 图表实例
                type: 'doughnut', // 图表类型：甜甜圈图 (或 'pie' 饼图)
                data: {
                    labels: labels, // X轴标签 (类型名称)
                    datasets: [{
                        label: '游戏类型分布', // 数据集标签
                        data: data, // Y轴数据 (类型数量)
                        backgroundColor: [ // 各类型对应的背景颜色
                            // 如果类型数量超过颜色数量，可以添加更多颜色
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(199, 199, 199, 0.7)',
                            'rgba(83, 102, 255, 0.7)',
                            'rgba(40, 159, 64, 0.7)',
                            'rgba(210, 99, 132, 0.7)'
                        ],
                        borderColor: [ // 各类型对应的边框颜色
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(199, 199, 199, 1)',
                            'rgba(83, 102, 255, 1)',
                            'rgba(40, 159, 64, 1)',
                            'rgba(210, 99, 132, 1)'
                        ],
                        borderWidth: 1 // 边框宽度
                    }]
                },
                options: { // 图表配置选项
                    responsive: true, // 响应式布局
                    maintainAspectRatio: false, // 不保持宽高比，允许图表填充容器
                    plugins: { // 插件配置
                        legend: { // 图例配置
                            position: 'top', // 图例显示在顶部
                        },
                        title: { // 标题配置
                            display: true, // 显示标题
                            text: '游戏类型分布' // 标题文本
                        }
                    }
                }
            });
        } else {
            genreChartPlaceholder.innerHTML = '<h4>游戏类型分布 (图表容器未找到)</h4>'; // 如果 canvas 元素未找到，则显示错误信息
        }
    }

    // --- 首页筛选器元素 ---
    const homeRatingFilter = document.getElementById('homeRatingFilter');
    const homeYearFilter = document.getElementById('homeYearFilter');
    const homeTypeFilter = document.getElementById('homeTypeFilter');

    // --- 初始加载逻辑 & 首页渲染 ---
    function populateHomeFilters() {
        if (!homeYearFilter || !homeTypeFilter) return;
        const currentGames = getGames();

        // 填充年份筛选器
        const years = [...new Set(currentGames.map(game => (game.releaseDate && typeof game.releaseDate === 'string') ? game.releaseDate.substring(0, 4) : null))]
                        .filter(year => year)
                        .sort((a, b) => b - a);
        homeYearFilter.innerHTML = '<option value="">所有年份</option>'; // Reset
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            homeYearFilter.appendChild(option);
        });

        // 填充类型筛选器 (使用 game.type)
        const types = [...new Set(currentGames.map(game => game.type).filter(type => type))].sort(); // 确保类型不为空并排序
        homeTypeFilter.innerHTML = '<option value="">所有类型</option>'; // Reset
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            homeTypeFilter.appendChild(option);
        });
    }

    function applyHomeFiltersAndRender() {
        const ratingFilterValue = homeRatingFilter ? homeRatingFilter.value : '';
        const yearFilterValue = homeYearFilter ? homeYearFilter.value : '';
        const typeFilterValue = homeTypeFilter ? homeTypeFilter.value : '';

        let filteredGames = [...getGames()];

        if (ratingFilterValue) {
            filteredGames = filteredGames.filter(game => {
                const gameRating = Math.round((game.rating || 0) / 2); // Assuming rating is 0-10, convert to 0-5 stars
                return gameRating === parseInt(ratingFilterValue) || (ratingFilterValue === '0' && (game.rating === null || game.rating === undefined || game.rating === 0));
            });
        }

        if (yearFilterValue) {
            filteredGames = filteredGames.filter(game => game.releaseDate && typeof game.releaseDate === 'string' && game.releaseDate.substring(0, 4) === yearFilterValue);
        }

        if (typeFilterValue) {
            filteredGames = filteredGames.filter(game => game.type === typeFilterValue);
        }

        renderHomePage(filteredGames); // 将过滤后的游戏传递给渲染函数
    }

    // 渲染主页函数
    function renderHomePage(gamesToRender = getGames()) { // 接受一个可选的游戏列表参数
        const homePageElement = document.getElementById('homePage');
        if (!homePageElement) return;

        let gameListContainer = homePageElement.querySelector('.home-game-grid'); // 使用新的类名
        if (!gameListContainer) {
            // 如果在 index.html 中已经定义了 .home-game-grid，这里理论上不应该执行
            // 但作为回退，如果找不到，则创建它
            console.warn('.home-game-grid not found, creating it dynamically. Check index.html structure.');
            gameListContainer = document.createElement('div');
            gameListContainer.className = 'home-game-grid content-area'; // 确保有 content-area
            
            // 清空 homePageElement 内容，然后添加新的 grid
            // 这假设 .home-filters 也在 homePageElement 内部，并且我们不想移除它
            // 更安全的做法是确保 .home-game-grid 存在于 index.html
            const existingFilters = homePageElement.querySelector('.home-filters');
            homePageElement.innerHTML = ''; // 清空
            if (existingFilters) homePageElement.appendChild(existingFilters); // 重新添加筛选器
            homePageElement.appendChild(gameListContainer);
        } else {
            gameListContainer.innerHTML = ''; // 清空已存在的 grid 内容
        }

        if (gamesToRender.length === 0) {
            gameListContainer.innerHTML = '<p style="text-align: center; margin-top: 20px;">没有符合筛选条件的游戏，或者您的游戏库是空的。</p>';
            return;
        }

        // Sort games: by rating (desc), then by type (asc), then by year (desc)
        // 排序应该在筛选之后，或者根据用户选择的排序方式进行
        const sortedGames = [...gamesToRender].sort((a, b) => {
            if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
            if (a.type && b.type) {
                if (a.type.toLowerCase() < b.type.toLowerCase()) return -1;
                if (a.type.toLowerCase() > b.type.toLowerCase()) return 1;
            }
            const yearA = (a.releaseDate && typeof a.releaseDate === 'string') ? parseInt(a.releaseDate.substring(0, 4)) : 0;
            const yearB = (b.releaseDate && typeof b.releaseDate === 'string') ? parseInt(b.releaseDate.substring(0, 4)) : 0;
            return yearB - yearA;
        });

        sortedGames.forEach(game => {
            const item = document.createElement('div');
            item.className = 'home-game-card'; // 使用新的卡片类名
            item.setAttribute('data-game-id', game.id);
            
            // 星级评分 (假设 game.rating 是 0-10)
            const gameRatingStars = Math.round((game.rating || 0) / 2);
            let starsHTML = '';
            for (let i = 0; i < 5; i++) {
                starsHTML += `<span class="star ${i < gameRatingStars ? '' : 'empty'}"></span>`;
            }

            item.innerHTML = `
                <img src="${game.cover || 'https://via.placeholder.com/150x200.png?text=N/A'}" alt="${game.name}" class="game-cover">
                <h3 class="game-name">${game.name}</h3>
                <div class="game-rating">
                    ${starsHTML}
                </div>
            `;
            // <p class="game-rating-text">(${(game.rating || 0).toFixed(1)} / 10)</p> // 可选：显示数字评分
            item.addEventListener('click', () => showGameDetails(game.id));
            gameListContainer.appendChild(item);
        });
    }

    // 为筛选器添加事件监听器
    if (homeRatingFilter) homeRatingFilter.addEventListener('change', applyHomeFiltersAndRender);
    if (homeYearFilter) homeYearFilter.addEventListener('change', applyHomeFiltersAndRender);
    if (homeTypeFilter) homeTypeFilter.addEventListener('change', applyHomeFiltersAndRender);
    // Initial page load logic
    populateHomeFilters(); // 填充首页筛选器选项
    if (savedPageId) {
        showPage(savedPageId);
        if (savedPageId === 'homePage') applyHomeFiltersAndRender(); // 使用带筛选的渲染
        if (savedPageId === 'libraryPage') renderLibraryPage();
        if (savedPageId === 'statsPage') renderStatsPage();
        // Add other pages if they need specific render functions on load
    } else {
        showPage('homePage');
        applyHomeFiltersAndRender(); // 确保主页内容被渲染并应用筛选
    }

    // 为其他页面的动态内容添加事件监听器或调用渲染函数
    // 例如，当点击主页导航项时渲染主页内容:
    const homeNavItem = document.querySelector('.nav-item[data-page="homePage"]');
    if (homeNavItem) {
        homeNavItem.addEventListener('click', () => {
            // populateHomeFilters(); // 可选：如果筛选选项可能在导航时改变
            applyHomeFiltersAndRender(); 
        });
    }
    // 例如，当点击资料库导航项时渲染资料库页面:
    const libraryNavItem = document.querySelector('.nav-item[data-page="libraryPage"]');
    if (libraryNavItem) {
        libraryNavItem.addEventListener('click', renderLibraryPage);
    }
    // 例如，当点击统计导航项时渲染统计页面:
    const statsNavItem = document.querySelector('.nav-item[data-page="statsPage"]');
    if (statsNavItem) {
        statsNavItem.addEventListener('click', renderStatsPage);
    }

    // --- 设置页面逻辑 ---
    // 获取暗黑模式切换开关元素
    const darkModeToggleInput = document.getElementById('darkModeToggleInput'); 
    if (darkModeToggleInput) {
        // 检查 localStorage 中保存的主题偏好
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') { // 如果保存的是暗黑模式
            document.body.classList.add('dark-mode'); // 应用暗黑模式样式
            darkModeToggleInput.checked = true; // 设置开关为选中状态
        }

        // 为暗黑模式切换开关添加事件监听器
        darkModeToggleInput.addEventListener('change', () => {
            if (darkModeToggleInput.checked) { // 如果开关被选中 (开启暗黑模式)
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark'); // 保存偏好到 localStorage
            } else { // 如果开关未被选中 (关闭暗黑模式)
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light'); // 保存偏好到 localStorage
            }
        });
    }

    // --- 设置页面导航和新页面逻辑 ---
    // 获取设置页面中各个管理页面的按钮元素
    const gameDataManagementBtn = document.getElementById('gameDataManagementBtn');
    const gamePlatformManagementBtn = document.getElementById('gamePlatformManagementBtn');
    const customTagManagementBtn = document.getElementById('customTagManagementBtn');

    // 为游戏数据管理按钮添加点击事件监听器
    if (gameDataManagementBtn) {
        gameDataManagementBtn.addEventListener('click', () => {
            renderGameDataManagementPage(); // 渲染游戏数据管理页面内容
            showPage('gameDataManagementPage'); // 显示游戏数据管理页面
        });
    }
    // 为游戏平台管理按钮添加点击事件监听器
    if (gamePlatformManagementBtn) {
        gamePlatformManagementBtn.addEventListener('click', () => {
            renderGamePlatformManagementPage(); // 渲染游戏平台管理页面内容
            showPage('gamePlatformManagementPage'); // 显示游戏平台管理页面
        });
    }
    // 为自定义标签管理按钮添加点击事件监听器
    if (customTagManagementBtn) {
        customTagManagementBtn.addEventListener('click', () => {
            renderCustomTagManagementPage(); // 渲染自定义标签管理页面内容
            showPage('customTagManagementPage'); // 显示自定义标签管理页面
        });
    }

    // 初始渲染资料库 (如果是默认页面或用于测试)
    populateTagFilter(); // 在首次渲染资料库之前填充标签过滤器
    renderLibraryPage(); // 渲染资料库页面
    renderStatsPage(); // 如果需要，也初始渲染统计页面

    // --- 自定义标签管理 --- (新部分)
    // 渲染自定义标签管理页面的函数
    function renderCustomTagManagementPage() {
        const tagManagementList = document.getElementById('tagManagementList'); // 获取标签管理列表元素
        const newTagManagementInput = document.getElementById('newTagManagementInput'); // 获取新标签输入框元素
        if (!tagManagementList || !newTagManagementInput) return; // 如果元素不存在，则退出函数

        tagManagementList.innerHTML = ''; // 清空现有的标签列表
        const currentCustomTags = getCustomTags();
        currentCustomTags.forEach((tag, index) => { // 遍历自定义标签数组
            const li = document.createElement('li'); // 为每个标签创建一个列表项
            li.textContent = tag; // 设置列表项文本为标签名称
            // 为每个标签添加删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.onclick = () => { // 为删除按钮添加点击事件
                if (confirm(`确定要删除标签 "${tag}" 吗？`)) { // 弹出确认对话框
                    const updatedTags = getCustomTags().filter((_, i) => i !== index);
                    setCustomTags(updatedTags);
                    saveCustomTags(); // 保存更新后的自定义标签数据
                    renderCustomTagManagementPage(); // 重新渲染标签列表
                    populateTagFilter(); // 更新资料库中的标签过滤器
                    // 可选：如果该标签已被游戏条目使用，则更新游戏条目
                }
            };
            li.appendChild(deleteBtn); // 将删除按钮添加到列表项
            tagManagementList.appendChild(li); // 将列表项添加到标签列表
        });
    }

    // 为管理页面上的添加新标签按钮添加事件监听器
    const addTagManagementBtn = document.getElementById('addTagManagementBtn');
    if (addTagManagementBtn) {
        addTagManagementBtn.addEventListener('click', () => {
            const newTagManagementInput = document.getElementById('newTagManagementInput'); // 获取新标签输入框
            const tagName = newTagManagementInput.value.trim(); // 获取输入的标签名称并去除首尾空格
            const currentCustomTags = getCustomTags();
            if (tagName && !currentCustomTags.includes(tagName)) { // 如果标签名称有效且不重复
                const updatedTags = [...currentCustomTags, tagName];
                setCustomTags(updatedTags);
                saveCustomTags(); // 保存更新后的自定义标签数据
                renderCustomTagManagementPage(); // 重新渲染标签列表
                populateTagFilter(); // 更新资料库中的标签过滤器
                newTagManagementInput.value = ''; // 清空输入框
            } else if (currentCustomTags.includes(tagName)) { // 如果标签已存在
                alert('该标签已存在。');
            } else { // 如果输入无效
                alert('请输入有效的标签名称。');
            }
        });
    }

    // --- 游戏数据管理 --- (新部分)
    // 渲染游戏数据管理页面的函数
    function renderGameDataManagementPage() {
        const gameDataList = document.getElementById('gameDataList'); // 获取游戏数据列表元素
        if (!gameDataList) return; // 如果元素不存在，则退出函数

        gameDataList.innerHTML = ''; // 清空现有的游戏数据列表
        const currentGames = getGames();
        if (currentGames.length === 0) { // 如果没有游戏数据
            gameDataList.innerHTML = '<p>没有游戏数据可管理。</p>';
            return;
        }

        const ul = document.createElement('ul'); // 创建一个无序列表元素
        ul.classList.add('game-data-management-list'); // 为列表添加样式类

        currentGames.forEach((game, index) => { // 遍历游戏数组
            const li = document.createElement('li'); // 为每个游戏创建一个列表项
            // 设置列表项的 HTML 内容，包含游戏名称、平台、状态以及编辑和删除按钮
            li.innerHTML = `
                <span>${game.name} (${game.platform || 'N/A'}) - ${game.status || '未指定状态'}</span>
                <div>
                    <button class="edit-gamedata-btn" data-game-id="${game.id}">编辑</button>
                    <button class="delete-gamedata-btn" data-game-id="${game.id}">删除</button>
                </div>
            `;
            ul.appendChild(li); // 将列表项添加到无序列表
        });
        gameDataList.appendChild(ul); // 将无序列表添加到游戏数据列表容器

        // 为编辑/删除按钮添加事件监听器 (基本结构)
        // 为编辑/删除按钮添加事件监听器
        document.querySelectorAll('.edit-gamedata-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.dataset.gameId;
                const gameToEdit = getGames().find(g => g.id === gameId);
                if (gameToEdit) {
                    window.editingGameId = gameId; // 设置编辑模式的ID
                    pageTitle.textContent = '编辑游戏'; // 更新页面标题
                    // 填充表单
                    document.getElementById('gameName').value = gameToEdit.name;
            document.getElementById('gamePlatform').value = gameToEdit.platform;
            // Set selected option in gameTypeSelect for editing
            gameTypeSelect.value = gameToEdit.type || ''; // game.type is now a string
            document.getElementById('releaseDate').value = gameToEdit.releaseDate;
                    document.getElementById('developer').value = gameToEdit.developer;
                    document.getElementById('gameRating').value = gameToEdit.rating || '';
                    document.getElementById('gameStatus').value = gameToEdit.status;
                    document.getElementById('gameProgress').value = gameToEdit.progress;
                    if(progressValueSpan) progressValueSpan.textContent = `${gameToEdit.progress}%`;
                    document.getElementById('playTime').value = gameToEdit.playTime;
                    document.getElementById('gameSummary').value = gameToEdit.summary;
                    if(coverPreview) coverPreview.src = gameToEdit.cover || 'https://via.placeholder.com/300x150.png?text=点击上传游戏封面图片';
                    showPage('addGamePage');
                } else {
                    alert('未找到要编辑的游戏。');
                }
            });
        });

        document.querySelectorAll('.delete-gamedata-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.dataset.gameId;
                const currentGames = getGames();
                const gameIndex = currentGames.findIndex(g => g.id === gameId);
                if (gameIndex !== -1) {
                    if (confirm(`确定要删除游戏 "${currentGames[gameIndex].name}" 吗？此操作无法撤销。`)) {
                        const updatedGames = currentGames.filter((_, i) => i !== gameIndex);
                        setGames(updatedGames);
                        saveGames(); // 保存更新后的游戏数据
                        renderGameDataManagementPage(); // 重新渲染游戏数据管理页面
                        renderLibraryPage(); // 更新资料库视图
                        renderStatsPage(); // 更新统计视图
                        renderHomePage(); // 更新主页视图 (如果它显示游戏计数等)
                        alert('游戏已删除。');
                    }
                } else {
                    alert('未找到要删除的游戏。');
                }
            });
        });
    }

    // 如果 customTags 数组发生变化 (例如，添加新标签后)，重新填充标签过滤器
    // 可以在 saveCustomTags() 之后或显示资料库页面时调用 populateTagFilter()
    const libraryNavItemForTags = document.querySelector('.nav-item[data-page="libraryPage"]');
    if (libraryNavItemForTags) {
        libraryNavItemForTags.addEventListener('click', () => {
            populateTagFilter(); // 填充标签过滤器
            renderLibraryPage(); // 确保使用可能的新过滤器渲染资料库
        });
    }

    // --- 导入/导出逻辑 ---
    // 导出数据函数
    function exportData() {
        const currentGames = getGames();
        const currentCustomTags = getCustomTags();
        const currentPlatforms = getPlatforms();
        if (currentGames.length === 0 && currentCustomTags.length === 0 && currentPlatforms.length === 0) { // 检查是否有任何数据可导出
            alert('没有数据可以导出。');
            return;
        }
        const dataToExport = { // 构建要导出的数据对象
            games: currentGames,
            customTags: currentCustomTags,
            platforms: currentPlatforms, // 也导出平台数据
            // settings: { theme: localStorage.getItem('theme') || 'light' }
        };

        const dataStr = JSON.stringify(dataToExport, null, 2); // 将数据对象转换为格式化的 JSON 字符串
        const blob = new Blob([dataStr], { type: 'application/json' }); // 创建一个 Blob 对象
        const filename = 'game_library_backup.json'; // 定义文件名

        // 尝试使用 File System Access API (如果可用)
        if ('showSaveFilePicker' in window) {
            const options = {
                suggestedName: filename,
                types: [{
                    description: 'JSON Files',
                    accept: {'application/json': ['.json']},
                }],
            };
            window.showSaveFilePicker(options).then(async (fileHandle) => {
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                alert(`数据已成功导出到：${fileHandle.name}`);
            }).catch(err => {
                // 如果用户取消或发生错误，则回退到传统下载方式
                console.warn('File System Access API-based save failed or cancelled, falling back to legacy download.', err);
                downloadFallback(blob, filename); // downloadFallback 不再包含 alert
                // 在此处为回退下载添加提示
                alert(`导出方式已回退，文件 ${filename} 可能已开始下载到您的默认下载文件夹。请检查浏览器下载内容或通知。`);
            });
        } else {
            // 传统下载方式
            downloadFallback(blob, filename);
        }
    }

    // 传统下载回退函数
    function downloadFallback(blob, filename) {
        const url = URL.createObjectURL(blob); // 创建一个指向 Blob 的 URL
        const a = document.createElement('a'); // 创建一个 <a> 元素用于下载
        a.href = url; // 设置下载链接
        a.download = filename; // 设置下载文件名
        document.body.appendChild(a); // 将 <a> 元素添加到页面 (某些浏览器需要)
        a.click(); // 模拟点击下载
        document.body.removeChild(a); // 从页面移除 <a> 元素
        URL.revokeObjectURL(url); // 释放创建的 URL 对象
        // 移除此处的 alert，提示将在调用此函数后处理
        console.log(`Fallback: Download initiated for ${filename}. Check browser downloads.`);
    }

    // 导入数据函数
    function importData(event) {
        const file = event.target.files[0]; // 获取用户选择的文件
        if (file) {
            const reader = new FileReader(); // 创建一个 FileReader 对象
            reader.onload = (e) => { // 当文件读取完成时
                try {
                    const importedData = JSON.parse(e.target.result); // 解析 JSON 数据
                    if (importedData.games) { // 如果导入的数据包含游戏数据
                        setGames(importedData.games); // 更新游戏数据
                        saveGames(); // 保存到 localStorage
                    }
                    if (importedData.customTags) { // 如果导入的数据包含自定义标签数据
                        setCustomTags(importedData.customTags); // 更新自定义标签数据
                        saveCustomTags(); // 保存到 localStorage
                        populateGameTypeSelect(); // Repopulate the new select dropdown
                    }
                    if (importedData.platforms) { // 如果导入的数据包含平台数据
                        setPlatforms(importedData.platforms);
                        savePlatforms();
                        populateGamePlatformSelect(); // 重新填充平台选择器
                        renderPlatformList(); // 重新渲染平台管理列表
                    }
                    // 如果导入的数据包含设置信息 (例如主题)
                    // if (importedData.settings && importedData.settings.theme) {
                    //     localStorage.setItem('theme', importedData.settings.theme);
                    //     if (importedData.settings.theme === 'dark') {
                    //         document.body.classList.add('dark-mode');
                    //         if(darkModeToggle) darkModeToggle.checked = true;
                    //     } else {
                    //         document.body.classList.remove('dark-mode');
                    //         if(darkModeToggle) darkModeToggle.checked = false;
                    //     }
                    // }
                    alert('数据导入成功！请刷新页面或重新导航以查看更改。');
                    renderLibraryPage(); // 重新渲染资料库
                    populateTagFilter(); // 重新填充标签过滤器
                    renderStatsPage(); // 重新渲染统计页面
                } catch (error) { // 如果解析失败
                    alert('导入失败：文件格式无效或已损坏。');
                    console.error('导入错误:', error);
                }
            };
            reader.readAsText(file); // 以文本形式读取文件内容 (修正: 之前是 readAsDataURL，对于JSON应为readAsText)
            event.target.value = null; // 重置文件输入框，以便可以重新导入同一个文件
        }
    }

    // 为导入/导出按钮添加事件监听器
    // (导出逻辑已符合用户期望，优先使用 showSaveFilePicker 让用户选择保存位置)

    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            // Add active class for click animation
            exportDataBtn.classList.add('active-setting');
            setTimeout(() => exportDataBtn.classList.remove('active-setting'), 300);
            exportData();
        });
    }

    // --- Settings Page Item Click Animation ---
    const settingsItems = document.querySelectorAll('#settingsPage .settings-item');
    settingsItems.forEach(item => {
        item.addEventListener('click', function() {
            // First, remove 'active-setting' from all settings items
            settingsItems.forEach(i => {
                // Don't remove from the dark mode toggle itself, as its state is visual
                if (!i.querySelector('#darkModeToggleInput')) {
                    i.classList.remove('active-setting');
                }
            });

            // Then, add 'active-setting' to the currently clicked item
            // unless it's the dark mode toggle container (which has its own visual state via the checkbox)
            // or an input element itself.
            if (!this.querySelector('#darkModeToggleInput') && this.tagName !== 'INPUT' && !this.querySelector('input[type="file"]')) {
                this.classList.add('active-setting');
            }

            // For items that perform an action but don't navigate (like export/import buttons, or future non-nav items)
            // we might want to remove the active state after a short delay for visual feedback,
            // but only if they are not meant to stay highlighted (e.g., a selected theme option).
            // The current issue is that items *without* specific actions (like '主题设置', '语言') stay active.
            // The new logic above ensures only one is active at a time.

            // Special handling for export/import buttons to remove active state after action
            if (this.id === 'exportDataBtn' || this.id === 'importDataLabel') { // Assuming importDataLabel is the clickable element for import
                // The exportDataBtn already handles its own active state removal in its specific listener.
                // For import, if it's a label, the click triggers the input. The active state might not be desired long-term.
                // If 'importDataLabel' is the settings-item itself:
                if (this.id === 'importDataLabel') {
                    setTimeout(() => this.classList.remove('active-setting'), 300); 
                }
            }

            // Handle navigation for items with data-page-target
            const targetPageId = this.dataset.pageTarget;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    const importDataInput = document.getElementById('importDataInput');
    if (importDataInput) {
        importDataInput.addEventListener('change', importData);
        // 允许点击标签来触发文件输入
        const importDataLabel = document.querySelector('label[for="importDataInput"]');
        if (importDataLabel) {
            importDataLabel.addEventListener('click', () => importDataInput.click());
        }
    }

    // Service Worker 注册
    if ('serviceWorker' in navigator) { // 检查浏览器是否支持 Service Worker
        window.addEventListener('load', () => { // 页面加载完成后执行
            navigator.serviceWorker.register('/service-worker.js') // 注册 Service Worker 文件
                .then(registration => {
                    console.log('ServiceWorker 注册成功，作用域为: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker 注册失败: ', error);
                });
        });
    }

    // 初始化页面加载时的筛选器和内容
    populateHomeFilters();
    applyHomeFiltersAndRender();
    populateGamePlatformSelect(); // 确保添加游戏页的平台选择已填充
    populateGameTypeSelect(); // 确保添加游戏页的类型选择已填充
    populateTagFilter(); // 确保库页的标签筛选已填充

    // --- 页面特定修改 ---
    // 为游戏数据管理页面添加提示
    const gameDataManagementPage = document.getElementById('gameDataManagementPage');
    if (gameDataManagementPage) {
        const unfinishedMessage = document.createElement('p');
        unfinishedMessage.textContent = '（此页面功能暂未完善）';
        unfinishedMessage.style.textAlign = 'center';
        unfinishedMessage.style.marginTop = '20px';
        unfinishedMessage.style.color = 'gray';
        gameDataManagementPage.appendChild(unfinishedMessage);
    }

    // 主题设置和语言设置现在有专门的页面，移除alert行为
    // 这些页面将通过通用的设置项点击逻辑处理


    // 首次加载时渲染管理列表（如果它们是默认显示的页面，或者为了确保数据准备好）
    // renderPlatformList(); 
    // renderCustomTagList();

    // Modify showPage to remove active-setting from settings items when navigating away from the main settings page
    // or to a sub-settings page (handled by the click on the item itself if it navigates)
    // Also, ensure back arrows are correctly shown/hidden based on the page.
    const originalShowPage_inner = showPage; // Capture the showPage defined within DOMContentLoaded
    showPage = function(pageId, isBack = false) { // Override the showPage defined within DOMContentLoaded
        if (typeof originalShowPage_inner === 'function') {
            originalShowPage_inner(pageId, isBack);
        }

        // --- Back Arrow Logic for Sub-Pages ---
        const backButton = document.getElementById('backButton');
        const pageTitleElement = document.getElementById('pageTitle');
        if (backButton && pageTitleElement) {
            // Define pages that should show the back button
            const subPages = [
                'aboutPage', 
                'helpFeedbackPage', 
                'customTagManagementPage', 
                'gamePlatformManagementPage',
                'gameDataManagementPage' // Added gameDataManagementPage
            ];
            if (subPages.includes(pageId)) {
                backButton.style.display = 'inline-block'; // Show back button
            } else {
                backButton.style.display = 'none'; // Hide back button for main pages
            }
        }

        // If we are navigating away from any page that is part of the settings section, 
        // or if we are navigating to a page that is NOT the main settings page, clear active states.
        const settingsPageContainer = document.getElementById('settingsPage');
        const settingsItems = document.querySelectorAll('#settingsPage .settings-item'); // Ensure settingsItems is defined in this scope or passed
        
        const currentPageElement = document.getElementById(pageId);
        const isLeavingSettingsSection = currentPageElement ? !currentPageElement.closest('#settingsPage') && 
                                       !['gameDataManagementPage', 'gamePlatformManagementPage', 'customTagManagementPage'].includes(pageId) : true;

        if (settingsPageContainer && (isLeavingSettingsSection || (pageId !== 'settingsPage' && !settingsPageContainer.contains(currentPageElement)))) {
            settingsItems.forEach(item => {
                if (!item.querySelector('#darkModeToggleInput')) { // Don't affect dark mode toggle's visual state
                    item.classList.remove('active-setting');
                }
            });
        }
    };
});