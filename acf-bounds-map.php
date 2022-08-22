<?php

/*
Plugin Name: Advanced Custom Fields by K: Bounds map
Plugin URI: X
Description: The plugin add a map for get bound area
Version: 1.0.0
Author: FABIEN CANU
Author URI: koality.fr
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

// exit if accessed directly
if (!defined('ABSPATH')) exit;


// check if class already exists
if (!class_exists('K_acf_plugin_bounds_map')) :

	class K_acf_plugin_bounds_map
	{

		// vars
		var $settings;


		/*
	*  __construct
	*
	*  This function will setup the class functionality
	*
	*  @type	function
	*  @date	17/02/2016
	*  @since	1.0.0
	*
	*  @param	void
	*  @return	void
	*/

		function __construct()
		{

			// settings
			// - these will be passed into the field class.
			$this->settings = array(
				'version'	=> '1.0.0',
				'url'		=> plugin_dir_url(__FILE__),
				'path'		=> plugin_dir_path(__FILE__)
			);


			// include field
			add_action('acf/include_field_types', 	array($this, 'include_field')); // v5
		}


		/*
	*  include_field
	*
	*  This function will include the field type class
	*
	*  @type	function
	*  @date	17/02/2016
	*  @since	1.0.0
	*
	*  @param	$version (int) major ACF version. Defaults to false
	*  @return	void
	*/

		function include_field($version = false)
		{

			// support empty $version
			if (!$version) $version = 4;


			// load textdomain
			load_plugin_textdomain('KACF', false, plugin_basename(dirname(__FILE__)) . '/lang');


			// include
			include_once('fields/class-k-acf-field-bounds-map-v' . $version . '.php');
		}
	}


	// initialize
	new K_acf_plugin_bounds_map();


// class_exists check
endif;
