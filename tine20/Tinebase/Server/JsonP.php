<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id$
 * 
 */

/**
 * JSONP Server 
 * 
 * simple jsonp server no json-rpc yet
 * 
 * @package     Tinebase
 * @subpackage  Server
 */
class Tinebase_Server_JsonP extends Tinebase_Server_Abstract
{
    
    public function handle()
    {
        $this->_initFramework();
        
        $method  = $_GET['method'];
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' is JSONP request. method: ' . $method);
        
        // only auth yet
        if ($method != 'Tinebase.authenticate') {
            $responseData = array(
                'status'    => 'fail',
                'msg'       => 'not allowed',
            );
        } else {
            // do some processing ...
            $responseData = array(
                'status'    => 'success',
                'msg'       => 'authentication succseed',
                //'loginUrl'  => 'https://somedomain/index.php'
            );
        }
        
        
        header('Content-Type: application/javascript');
        die ($_GET['jsonp'] . '(' . Zend_Json::encode($responseData) . ');');
    }
}