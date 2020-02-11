var token = $.cookie( "x-access-token" );

$(function(){
  getTransactions();
});

function getTransactions(){
  /*
  $.ajax({
    type: 'GET',
    url: '/history',
    headers: { 'x-access-token': token },
    success: function( result ){
      if( result.status ){
        var transactions = result.history;
        transactions.forEach( function( transaction ){
          var yyyymmdd = transaction.datetime;
          var tr = '<tr><td><a target="_blank" href="/simulation/' + yyyymmdd + '">' + yyyymmdd2date( yyyymmdd ) + '</a></td>'
            + '<td>' + transaction.created + '</td>'
          $('#transactions_table_tbody').append( tr );
        });

        $('#transactions_table').DataTable({
          language: { url: "//cdn.datatables.net/plug-ins/1.10.16/i18n/Japanese.json" },
          lengthChange: true,
          searching: false,
          ordering: false,
          info: false,
          paging: true
        });

        //. https://datatables.net/forums/discussion/41870/column-width-not-working
        $('#transactions_table').css( { 'width': '100%' } );
        $('#transactions_table > thead > tr > th:nth-child(1)').css( { 'width': '200px' } );
        $('#transactions_table > thead > tr > th:nth-child(2)').css( { 'width': '200px' } );
      }
    },
    error: function( e0, e1, e2 ){
      console.log( e1, e2 );
    }
  });
  */
}
