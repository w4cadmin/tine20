<?php
/**
 * Tine 2.0 - http://www.tine20.org
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Jonas Fischer <j.fischer@metaways.de>
 * @version     $Id: Mysql.php 1703 2008-04-03 18:16:32Z lkneschke $
 */

 
class Setup_Backend_Schema_Field_Oracle extends Setup_Backend_Schema_Field_Abstract
{

    public function __construct($_declaration)
    {
        $this->_setField($_declaration);
    }
    
    /**
     * set Setup_Backend_Schema_Table from a given database query 
     *
     * @todo this function does not work is_array and -> does not fit together
     * @param stdClass $_declaration
     */    
    protected function _setField($_declaration)
    {
        if (is_array($_declaration)) {
            $this->name = $_declaration['COLUMN_NAME'];
            $type = '';
            $length= '';
            
            switch ($_declaration['DATA_TYPE']) {
                case('NUMBER'):
                    $type = 'integer';
                    $length = (int)$_declaration['LENGTH'];
                    break;
            
                case('tinyint'):
                    $type = $_declaration['DATA_TYPE'];
                    $length = $_declaration['NUMERIC_PRECISION'] + 1;
                    break;
                
                case('enum'):
                    $type = $_declaration['DATA_TYPE'];
                    $this->value = explode(',', str_replace("'", '', substr($_declaration['COLUMN_TYPE'], 5, (strlen($_declaration['COLUMN_TYPE']) - 6))));
                    break;
                
                case('VARCHAR2'):
                    $length = $_declaration['LENGTH'];
                    $type = 'text';
                
                default:
                    $length = $_declaration['LENGTH'];
                    $type = $_declaration['DATA_TYPE'];
                }

            if (isset($_declaration['EXTRA']) && $_declaration['EXTRA'] == 'autoincrement') {
                $this->autoincrement = 'true';
            }

            if (!empty($_declaration['UNSIGNED'])) {
                $this->unsigned = 'true';
            }

            $_declaration['NULLABLE'] ? $this->notnull = 'false': $this->notnull = 'true';
            //($_declaration['COLUMN_KEY'] == 'UNI')? $this->unique = 'true': $this->unique = 'false';
            $_declaration['PRIMARY'] ? $this->primary = 'true': $this->primary = 'false';
            //($_declaration['COLUMN_KEY'] == 'MUL')? $this->mul = 'true': $this->mul = 'false';

            //$this->comment = $_declaration['COLUMN_COMMENT'];
            $this->length = $length;
            $this->type = $type;
            
        }
    }
}