$(document).ready(function() {
    mount(new AdminPanel({active: 2}), document.querySelector(".nav-left-container"));

    var movieList;
    getAllMovies();

    getActivities();

    function getActivities() {
        getRequest(
            '/activity/getAll',
            function (res) {
                var activities = res.content;
                renderActivities(activities);
            },
            function (error) {
                alert(JSON.stringify(error));
            }
        );
    }
    
    function renderActivities(activities) {
        $(".content-activity").empty();
        var activitiesDomStr = "";

        activities.forEach(function (activity) {
            var movieDomStr = "";
            if(activity.movieList.length){
                activity.movieList.forEach(function (movie) {
                    movieDomStr += "<li class='activity-movie primary-text'>"+movie.name+"</li>";
                });
            }else{
                movieDomStr = "<li class='activity-movie primary-text'>所有热映电影</li>";
            }

            activitiesDomStr+=
                "<div class='activity-container'>" +
                "    <div class='activity-card card'>" +
                "       <div class='activity-line title-line'>" +
                "           <span class='title'>"+activity.name+"</span>" +
                "           <span class='gray-text'>"+activity.description+"</span>" +
                "       </div>" +
                "       <div class='activity-line'>" +
                "           <span>活动时间："+formatDate(new Date(activity.startTime))+"至"+formatDate(new Date(activity.endTime))+"</span>" +
                "       </div>" +
                "       <div class='activity-line'>" +
                "           <span>活动需满金额："+activity.targetAmount+"</span>" +
                "       </div>" +
                "       <div class='activity-line'>" +
                "           <span>参与电影：</span>" +
                "               <ul>"+movieDomStr+"</ul>" +
                "       </div>" +
                "       <div class='activity-item'>"+
                "           <a class='a-change'>修改</a>"+
                "           <a class='a-delete'>删除</a>"+
                "           <input type='hidden' name='activity-id' value='"+activity.id+"'/>"+
                "       </div>"+
                "    </div>" +
                "    <div class='activity-coupon primary-bg'>" +
                "        <span class='title'>优惠券："+activity.coupon.name+"</span>" +
                "        <span class='title'>满"+activity.coupon.targetAmount+"减<span class='error-text title'>"+activity.coupon.discountAmount+"</span></span>" +
                "        <span class='gray-text'>"+activity.coupon.description+"</span>" +
                "    </div>" +
                "</div>";
        });
        $(".content-activity").append(activitiesDomStr);
    }

    function getAllMovies() {
        getRequest(
            '/movie/all/exclude/off',
            function (res) {
                movieList = res.content;
                $('#activity-movie-input').append("<option value="+ -1 +">所有电影</option>");
                movieList.forEach(function (movie) {
                    $('#activity-movie-input').append("<option value="+ movie.id +">"+movie.name+"</option>");
                });
            },
            function (error) {
                alert(error);
            }
        );
    }

    //ES6新api 不重复集合 Set
    var selectedMovieIds = new Set();
    var selectedMovieNames = new Set();

    $('#activity-movie-input').change(function () {
        var movieId = $('#activity-movie-input').val();
        var movieName = $('#activity-movie-input').children('option:selected').text();
        if(movieId==-1){
            movieList.forEach(function(movie){
                selectedMovieIds.add(movie.id);
                selectedMovieNames.add(movie.name);
            });
        } else {
            selectedMovieIds.add(movieId);
            selectedMovieNames.add(movieName);
        }
        renderSelectedMovies();
    });

    //渲染选择的参加活动的电影
    function renderSelectedMovies() {
        $('#selected-movies').empty();
        var moviesDomStr = "";
        selectedMovieNames.forEach(function (movieName) {
            moviesDomStr += "<span class='label label-primary'>"+movieName+"</span>";
        });
        $('#selected-movies').append(moviesDomStr);
    }

    //修改活动
    $('.content-activity').on('click','.a-change',function() {
        activityId=$(this).parent('.activity-item').children('input').val();
        changeActivityModal(activityId);
    });

    $('.content-activity').on('click','.a-delete',function() {
        getRequest(
            '/activity/delete?activityId='+$(this).parent('.activity-item').children('input').val(),
            function(res){
                getActivities();
            },
            function(error){
                alert(error);
            }
        );
    });

    function changeActivityModal(activityId){
        getRequest(
            '/activity/get?activityId='+activityId,
            function(res){
                activity=res.content;
                $("#activityModalLabel").text("修改活动");
                $("#activity-name-input").attr('value',activity.name);
                $("#activity-description-input").attr('value',activity.description);
                $("#activity-start-date-input").attr('value',activity.startTime);
                $("#activity-end-date-input").attr('value',activity.endTime);
                $("#coupon-name-input").attr('value',activity.coupon.name);
                $("#coupon-description-input").attr('value',activity.coupon.description);
                $("#activity-target-input").attr('value',activity.targetAmount);
                $("#coupon-target-input").attr('value',activity.coupon.targetAmount);
                $("#coupon-discount-input").attr('value',activity.coupon.discountAmount);
                $("#selected-movies").empty();
                activity.movieList.forEach(function(movie){
                    $("#selected-movies").append("<span class='label label-primary'>"+movie.name+"</span>");
                    selectedMovieNames.add(movie.name);
                    selectedMovieIds.add(movie.id);
                });
                $("#activity-form-btn").attr('id','activity-form-btn-change');
                $("#activityModal").modal('show');
            },
            function(error){
                alert(error);
            }
        )

    }

    function addActivity(){

        if(selectedMovieIds.size==0){
            movieList.forEach(function(movie){
                selectedMovieIds.add(movie.id);
                selectedMovieNames.add(movie.name);
            });
        }

       var form = {
           name: $("#activity-name-input").val(),
           description: $("#activity-description-input").val(),
           startTime: $("#activity-start-date-input").val(),
           endTime: $("#activity-end-date-input").val(),
           targetAmount: $("#activity-target-input").val(),
           movieList: [...selectedMovieIds],
           couponForm: {
               description: $("#coupon-name-input").val(),
               name: $("#coupon-description-input").val(),
               targetAmount: $("#coupon-target-input").val(),
               discountAmount: $("#coupon-discount-input").val(),
               startTime: $("#activity-start-date-input").val(),
               endTime: $("#activity-end-date-input").val()
           }
       };

        postRequest(
            '/activity/publish',
            form,
            function (res) {
                if(res.success){
                    getActivities();
                    $("#activityModal").modal('hide');
                } else {
                    alert(res.message);
                }
            },
            function (error) {
                alert(JSON.stringify(error));
            }
        );

        $("#activityModalLabel").text("发布活动");
        $("#activity-name-input").attr('value',"");
        $("#activity-description-input").attr('value',"");
        $("#activity-start-date-input").attr('value',"");
        $("#activity-end-date-input").attr('value',"");
        $("#coupon-name-input").attr('value',"");
        $("#coupon-description-input").attr('value',"");
        $("#activity-target-input").attr('value',"");
        $("#coupon-target-input").attr('value',"");
        $("#coupon-discount-input").attr('value',"");
        $("#selected-movies").empty();
        selectedMovieNames.clear();
        selectedMovieIds.clear();
    }

    $("#activityModal").on('click','#activity-form-btn-change',function(){
        addActivity();
        $("#activity-form-btn-change").attr('id','activity-form-btn');
        getRequest(
            '/activity/delete?activityId='+activityId,
            function(res){
                getActivities();
            },
            function(error){
                alert(error);
            }
        );
    });

    $("#activityModal").on('click','#activity-form-btn',function () {
        addActivity();
    });
});