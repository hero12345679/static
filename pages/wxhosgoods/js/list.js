$.ajaxSetup({
	headers: {
		"Content-Type": "application/json;charset=utf-8",
		"token": window.localStorage.getItem('m_token')
	},
	complete: function (res) {
		if (JSON.parse(res.responseText).code == '401') {
			window.top.location.href = '../../login.html';
		}
	}
});
$().ready(function () {
	var m_url = location.protocol + '\\\\' + location.hostname + ':' + (location.port == '' ? 80 : location.port);
        $.ajax({
            url: m_url+'/sys/hosgoodstype/getGoodsTypeTrees',
            contentType: 'application/json;charset=utf-8',
            method: 'post',
            dataType: 'JSON',
            success: function (res) {
                if (res.code = '0') {
                    layui.tree({
                        elem: '#goodsTypeShu'
                        , nodes: [{ //节点数据
                            name: '菜品类别'
                            , children: res.data
                        }]
                        , click: function (node) {
                            console.log(node) //node即为当前点击的节点数据
                            layui.table.reload('testReload', {
                                where: {
                                    goodsTypeGuid: node.rowGuid
                                }
                            });
                        }
                    });
                } else
                    alert(res.msg);
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    });
$("body").on("mousedown",".layui-tree a cite",function(){
        $(".layui-tree a cite").css('color','#000000')
        $(this).css('color','#5d7bdc')
    });
	layui.use('table', function(){
        var table = layui.table;
        var m_url = location.protocol + '\\\\' + location.hostname + ':' + (location.port == '' ? 80 : location.port);
        table.render({
            elem: '#table'
            ,height: 'full-130'
            ,even:true
            ,url:m_url+'/sys/wxhosgoods/listData'
            ,method:'get'
            ,cols: [[
                {checkbox:true}
	            ,{field:'rowId', width:80, title: 'ID', sort: true}
	            ,{field:'goodsName', width:80, title: '菜品名称', sort: true}
	            ,{field:'goodsPrice', width:80, title: '菜品价格', sort: true}
	            ,{field:'goodsImgGuid', width:80, title: '菜品图片标识'}
	            ,{field:'goodsInfo', width:80, title: '菜品信息', sort: true}
	            ,{field:'isShelf', width:80, title: '是否上架', sort: true,templet:'#checkShelf'}
				,{field:'sortSq', width:80, title: '排序号', sort: true}
	            ,{field:'right',title:'操作',toolbar:'#barDemo',width:150}
            ]]
            , page: true
            , limit:10 //默认十条数据一页
            , id:'testReload'
        });
   

        //角色关键字搜索
        var $ = layui.$, active = {
            reload: function () {
                var keyword = $('#goodsNameKey');

                table.reload('testReload', {
                    where: {
                        goodsNameVague: keyword.val()
                    }
                });
            }
        };
        //搜索绑定
        $('#goodsFind').on('click', function () {
            var type = $(this).data('type');
            active[type] ? active[type].call(this) : '';
        });


        //新增
        $('#goodsAdd').on('click', function(){
            var data = 'add';
            layer.open({
                type: 2,
                title: '菜品添加',
                maxmin: true,
                shadeClose: true, //点击遮罩关闭层
                area : ['500px', '500px'],
                content: 'Edit.html',
                success: function(layero, index){
                    var body = layer.getChildFrame('body',index);
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                    iframeWin.inputDataHandle(data);
                },
                end: function (){
                    //刷新页面
                    window.location.reload()
                }
            });
        });

        //删除
        $('#goodsDel').on('click', function(){
            layer.confirm('你确定删除吗！', function(index){
                var cache = table.cache;
                var params = new Array;
                $.each(cache.testReload,function(index,value){
                    if(value.LAY_CHECKED != undefined && value.LAY_CHECKED == true){
                        params.push(value.rowGuid);
                    }
                });
                if(params.length == 0){
                    layer.msg("请先选择");
                    return;
                }
                $.ajax({
                    url:m_url+'/sys/wxhosgoods/delete',
                    contentType: 'application/json;charset=utf-8',
                    method:'post',
                    data:JSON.stringify(params),
                    dataType:'JSON',
                    success:function(res){
                        if(res.code=='0'){
                            layer.msg('删除成功', {
                                icon: 1,
                                time: 1000 //2秒关闭（如果不配置，默认是3秒）
                            },function(){
                                window.location.reload();
                            });
                        }
                        if(res.code=='500'){
                        	layer.msg(res.msg)
                        }
                    },
					error: function (jqXHR, textStatus, errorThrown) {

					}
                });
                layer.close(index);
            });
        });



        //编辑
		var m_url = location.protocol + '\\\\' + location.hostname + ':' + (location.port == '' ? 80 : location.port);
        table.on('tool(toolbar)', function (obj) {
            var value = obj.data;
            if (obj.event === 'edit') {
                //更新
                var data = 'edit';
                layer.open({
                    type: 2,
                    title: 'iframe父子操作',
                    maxmin: true,
                    shadeClose: true, //点击遮罩关闭层
                    area: ['500px', '500px'],
                    content: 'Edit.html',
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        iframeWin.inputDataHandle(data);
                       body.find("#rowId").val(value.rowId);
                       body.find("#rowGuid").val(value.rowGuid);
                       body.find("#goodsName").val(value.goodsName);
                       body.find("#goodsTypeGuid").val(value.goodsTypeGuid);
                       body.find("#goodsImgGuid").val(value.goodsImgGuid);
                       body.find("#goodsInfo").val(value.goodsInfo);
                       body.find("#sortSQ").val(value.sortSq);
					   body.find("#isShelf").val(value.isShelf);
                    },
                    end: function () {
                        //刷新页面
                        window.location.reload()
                    }
                });
            }
    });

});
