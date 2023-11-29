document.addEventListener('DOMContentLoaded', function() {
    var categorySelect = document.getElementById('modelCategory');
    var detailsSelect = document.getElementById('modelDetails');
    var addButton = document.getElementById('addButton');
    var itemsList = document.getElementById('itemsList');
    var contextMenu = document.getElementById('contextMenu');
    var moveTo = document.getElementById('moveTo');
    var openReport = document.getElementById('openReport');
    var showData = document.getElementById('showData');
    var dataPopup = document.getElementById('dataPopup');
    var selectedItem;

    var menuItems = document.querySelectorAll('#contextMenu li');
    
    // チェックを追加または削除する関数
    function updateCheckmark(selectedItem) {
        menuItems.forEach(function(item) {
            var checkmark = item.querySelector('.checkmark');
            if (!checkmark) {
                checkmark = document.createElement('span');
                checkmark.className = 'checkmark';
                checkmark.textContent = '✔ ';
                item.insertBefore(checkmark, item.firstChild);
            }
            checkmark.style.display = (item === selectedItem) ? '' : 'none';
        });
    }

    // 各メニュー項目のクリックイベントを設定
    menuItems.forEach(function(item) {
        if (!item.classList.contains('inactive')) { // 非アクティブな項目を除外
            item.addEventListener('click', function() {
                updateCheckmark(this);

                // ここで各項目の具体的な処理を実装
                // ...
            });
        }
    });

    // 閉じるボタンの取得
    var closeButton = document.querySelector('.data-popup .closeButton');

    // 閉じるボタンのイベントハンドラー
    closeButton.addEventListener('click', function() {
        // ポップアップウインドウを閉じる
        var popup = this.closest('.data-popup');
        if (popup) {
            popup.style.display = 'none';
        }
    });

    var searchInput = document.querySelector('.search-container input');

    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            // Enterキーが押されたときの処理
            alert(this.value); // 検索窓の値をalertで表示
            this.value = '';   // 検索窓の中身をクリア
        }
    });


    document.getElementById('itemsList').addEventListener('contextmenu', function(event) {
        event.preventDefault();
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.display = 'block';

        var target = event.target.closest('[data-category]');
        if (!target) return;
        var latitude = target.getAttribute('data-latitude');
        var longitude = target.getAttribute('data-longitude');

        selectedItem = target;
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.display = 'block';

        moveTo.onclick = function() {
            alert('Latitude: ' + latitude + ', Longitude: ' + longitude);
        };

        openReport.onclick = function() {
            window.open('https://www.yahoo.co.jp/', '_blank');
        };
    });

    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });

    showData.addEventListener('click', function() {
        // データポップアップの内容をクリア
        dataTable.innerHTML = '';

        if (selectedItem) {
            // データを表形式で表示
            var rowId = dataTable.insertRow();
            rowId.insertCell().textContent = 'ID';
            rowId.insertCell().textContent = selectedItem.getAttribute('data-id');
    
            // 緯度の行を追加
            var rowLat = dataTable.insertRow();
            rowLat.insertCell().textContent = '緯度';
            rowLat.insertCell().textContent = selectedItem.getAttribute('data-latitude');
    
            // 経度の行を追加
            var rowLon = dataTable.insertRow();
            rowLon.insertCell().textContent = '経度';
            rowLon.insertCell().textContent = selectedItem.getAttribute('data-longitude');
        }

        dataPopup.style.display = 'block';
    });


    categorySelect.addEventListener('change', function() {
        var selectedCategory = categorySelect.value;
        switch(selectedCategory) {
            case 'bridge':
                loadData('bridge.json', 'bridges', 'name');
                break;
            case 'road':
                loadData('road.json', 'roads', 'id');
                break;
            case 'ground':
                loadData('ground.json', 'grounds', 'id');
                break;
        }
    });

    function loadData(jsonFile, arrayProperty, displayProperty) {
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                updateDetailsSelect(data[arrayProperty], displayProperty);
            })
            .catch(error => console.error('Error:', error));
    }

    function updateDetailsSelect(items, property) {
        detailsSelect.innerHTML = '';
        var defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select Model';
        defaultOption.value = '';
        detailsSelect.appendChild(defaultOption);

        items.forEach(function(item) {
            var option = document.createElement('option');
            option.textContent = item[property];
            option.value = item['id'];
            detailsSelect.appendChild(option);
        });
    }

    var rangeButton = document.getElementById('rangeButton');
    var popupWindow = document.getElementById('popupWindow');
    var closeButton = document.getElementsByClassName('closeButton')[0];

    rangeButton.addEventListener('click', function() {
        popupWindow.style.display = 'block';
    });

    closeButton.addEventListener('click', function() {
        popupWindow.style.display = 'none';
    });

    var refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', function() {
        itemsList.innerHTML = ''; // itemsListの中身を全て消去
    });

    var applyButton = document.getElementById('applyButton');
    var latStart, latEnd, lonStart, lonEnd;

    applyButton.addEventListener('click', function() {
        latStart = parseFloat(document.getElementById('latitudeStart').value);
        latEnd = parseFloat(document.getElementById('latitudeEnd').value);
        lonStart = parseFloat(document.getElementById('longitudeStart').value);
        lonEnd = parseFloat(document.getElementById('longitudeEnd').value);
        var bridgeCheckbox = document.getElementById('bridgeCheckbox');
        var roadCheckbox = document.getElementById('roadCheckbox');
        var groundCheckbox = document.getElementById('groundCheckbox');

        if (bridgeCheckbox.checked) {
            loadData('bridge.json', 'bridge');
        }
        if (roadCheckbox.checked) {
            loadData('road.json', 'road');
        }
        if (groundCheckbox.checked) {
            loadData('ground.json', 'ground');
        }

        popupWindow.style.display = 'none';
    });

    function loadData(jsonFile, category) {
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                data[category + 's'].forEach(function(item) {
                    if (item.latitude >= latStart && item.latitude <= latEnd && 
                        item.longitude >= lonStart && item.longitude <= lonEnd) {
                        // addItemToListにはカテゴリとアイテム全体を渡す
                        addItemToList(category, item);
                    }
                });
            })
            .catch(error => console.error('Error:', error));
    }
    

    var showData = document.getElementById('showData');
    var dataPopup = document.getElementById('dataPopup');

    addButton.addEventListener('click', function() {
        
        var selectedCategory = categorySelect.value;
        var selectedText = detailsSelect.options[detailsSelect.selectedIndex].text;
        if (selectedText !== 'Select Model') {
            addItemToList(selectedCategory, selectedText);
        }
    });

    function addItemToList(category, item) {
        var listItem = document.createElement('div');
        listItem.setAttribute('data-category', category);
        listItem.setAttribute('data-id', item.id);
        listItem.setAttribute('data-latitude', item.latitude);
        listItem.setAttribute('data-longitude', item.longitude);
    
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.id;
        checkbox.name = item.id;
        checkbox.checked = true;
    
        var categoryLabel = document.createElement('span');
        categoryLabel.style.fontWeight = 'bold';
    
        if (category === 'bridge') {
            categoryLabel.textContent = 'Bridges:';
            categoryLabel.style.color = 'red';
        } else if (category === 'road') {
            categoryLabel.textContent = 'Roads:';
            categoryLabel.style.color = 'blue';
        } else if (category === 'ground') {
            categoryLabel.textContent = 'Ground:';
            categoryLabel.style.color = 'green';
        }
    
        var textLabel = document.createElement('label');
        textLabel.htmlFor = item.id;
        textLabel.appendChild(document.createTextNode(' ' + (item.name || item.id)));
        
        listItem.appendChild(checkbox);
        listItem.appendChild(categoryLabel);
        listItem.appendChild(textLabel);
    
        itemsList.appendChild(listItem);
    }
    
});