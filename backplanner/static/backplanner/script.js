window.onload = function() {

    $('#howItWorksExpand').on('click', (e)=>{
        let $unit = $('#howItWorksExpand');
        if ($unit.hasClass('bi-arrow-down-square')) {
            $unit.removeClass('bi-arrow-down-square').addClass('bi-arrow-up-square');
        } else {
            $unit.removeClass('bi-arrow-up-square').addClass('bi-arrow-down-square'); 
        }
    });

}