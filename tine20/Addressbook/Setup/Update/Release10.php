<?php
/**
 * Tine 2.0
 *
 * @package     Addressbook
 * @subpackage  Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2014-2016 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schüle <p.schuele@metaways.de>
 */
class Addressbook_Setup_Update_Release10 extends Setup_Update_Abstract
{
    /**
     * update to 10.1: add list_roles table
     *
     * @return void
     */
    public function update_0()
    {
        $update9 = new Addressbook_Setup_Update_Release9($this->_backend);
        $update9->update_9();
        $this->setApplicationVersion('Addressbook', '10.1');
    }
}
