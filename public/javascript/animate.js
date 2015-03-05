$(document).ready(function(){
	$(".button").hover(
		function() {
			$(this).stop().animate({"opacity": "0.6"}, "fast");
		},
		function() {
			$(this).stop().animate({"opacity": "1"}, "fast");
		}
	);
	$("*.color").hover(
		function() {
			$(this).stop().animate({"opacity": "0.25"}, "fast");
		},
		function() {
			$(this).stop().animate({"opacity": "1"}, "fast");
		}
	);
	$("*.svg").hover(
		function() {
			$(this).stop().animate({"opacity": "0.5"}, "fast");
		},
		function() {
			$(this).stop().animate({"opacity": "1"}, "fast");
		}
	);
	$("*.text").hover(
		function() {
			$(this).stop().animate({"opacity": "0.5"}, "fast");
		},
		function() {
			$(this).stop().animate({"opacity": "1"}, "fast");
		}
	);
	$("*.menuItem").hover(
		function() {
			$(this).stop().animate({"opacity": "0.6"}, "fast");
		},
		function() {
			$(this).stop().animate({"opacity": "1"}, "fast");
		}
	);
	$("*.topMenuItem").hover(
		function() {
			$(this).stop().animate({"opacity": "0.6"}, "fast");
		},
		function() {
			$(this).stop().animate({"opacity": "1"}, "fast");
		}
	);
});