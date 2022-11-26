$(document).ready(function(){
    $('.cat').click(function(){
      const value = $(this).attr('data-filter');
      $('.itemBox').not('.'+value).hide('1000');
      $('.itemBox').filter('.'+value).show('1000');
    })
  })