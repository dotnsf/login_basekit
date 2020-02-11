
var ua = navigator.userAgent.toLowerCase();
var browser = null;
if( ua.indexOf( 'msie' ) != -1 || ua.indexOf( 'trident' ) != -1 ){
  browser = 'msie';
}else if( ua.indexOf( 'edge' ) != -1 ){
  browser = 'edge';
}else if( ua.indexOf( 'chrome' ) != -1 ){
  browser = 'chrome';
}else if( ua.indexOf( 'safari' ) != -1 ){
  browser = 'safari';
}else if( ua.indexOf( 'firefox' ) != -1 ){
  browser = 'firefox';
}else if( ua.indexOf( 'opera' ) != -1 ){
  browser = 'opera';
}

function logout(){
  if( window.confirm( 'ログアウトしますか？' ) ){
    $.ajax({
      type: 'POST',
      url: '/logout',
      headers: { 'x-access-token': token },
      data: {},
      success: function( data ){
        $.removeCookie( 'x-access-token' );
        window.location.href = '/';
      },
      error: function( e0, e1, e2 ){
        $.removeCookie( 'x-access-token' );
        window.location.href = '/';
      }
    });
  }
}

function abbreviateArray( arr ){
  var str = '[';
  if( arr && Array.isArray( arr ) && arr.length > 0 ){
    if( typeof( arr[0] ) == 'string' ){
      str += '"' + arr[0] + '"';
    }else{
      str += arr[0];
    }
    if( arr.length > 1 ){
      str += ',..'
    }
  }
  str += ']';

  return str;
}

function timestamp2datetime( ts ){
  var dt = new Date( ts );
  var yyyy = dt.getFullYear();
  var mm = dt.getMonth() + 1;
  var dd = dt.getDate();
  var hh = dt.getHours();
  var nn = dt.getMinutes();
  var ss = dt.getSeconds();
  var datetime = yyyy + '-' + ( mm < 10 ? '0' : '' ) + mm + '-' + ( dd < 10 ? '0' : '' ) + dd
    + ' ' + ( hh < 10 ? '0' : '' ) + hh + ':' + ( nn < 10 ? '0' : '' ) + nn + ':' + ( ss < 10 ? '0' : '' ) + ss;
  return datetime;
}

function datetime2yyyymmdd( datetime ){
  var tmp = datetime.split( '/' );
  if( tmp.length > 1 ){
    return tmp.join( '' );
  }else{
    tmp = datetime.split( '-' );
    if( tmp.length > 1 ){
      return tmp.join( '' );
    }else{
      return datetime;
    }
  }
}

function yyyymmdd2date( yyyymmdd ){
  var yyyy = yyyymmdd.substr( 0, 4 );
  var mm = yyyymmdd.substr( 4, 2 );
  var dd = yyyymmdd.substr( 6 );

  return yyyy+'-'+mm+'-'+dd;
}

function format00( n ){
  return ( Math.round( n * 100 ) / 100 ).toFixed( 2 );
}

function cardname( name ){
  if( name.indexOf( '電力小売') > -1 ){
    return name + '　　　　';
  }else{
    return name;
  }
}

function toggle_display( id ){
  var dp = $('#'+id).css( 'display' );
  if( dp == 'none' ){ $('#'+id).css( 'display', 'block' ); }
  else if( dp == 'block' ){ $('#'+id).css( 'display', 'none' ); }
}

function compare( a, b, by, rev ){
  var r = 0;
  var target = 'timestamp';
  if( by ){ target = by; };
  if( rev ){
    if( a[target] < b[target] ){ r = 1; }
    else if( a[target] > b[target] ){ r = -1; }
  }else{
    if( a[target] < b[target] ){ r = -1; }
    else if( a[target] > b[target] ){ r = 1; }
  }

  return r;
}

function compareByAmount( a, b ){
  return compare( a, b, 'amount', false );
}

function compareByAmountRev( a, b ){
  return compare( a, b, 'amount', true );
}

function compareByPrice( a, b ){
  return compare( a, b, 'price', false );
}

function compareByPriceRev( a, b ){
  return compare( a, b, 'price', true );
}

function compareByTotalPrice( a, b ){
  return compare( a, b, 'totalprice', false );
}

function compareByTotalPriceRev( a, b ){
  return compare( a, b, 'totalprice', true );
}

function compareByDatetime( a, b ){
  return compare( a, b, 'datetime', false );
}

function compareByDatetimeRev( a, b ){
  return compare( a, b, 'datetime', true );
}

function compareByFrom( a, b ){
  return compare( a, b, 'from', false );
}
