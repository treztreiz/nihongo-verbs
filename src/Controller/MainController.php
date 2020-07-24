<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use GuzzleHttp\Client as GuzzleClient;

class MainController extends AbstractController
{
    /**
     * @Route("/", name="main")
     */
    public function index()
    {
        return $this->render('main/index2.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }
    /**
     * @Route("/2", name="main2")
     */
    public function index2()
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    /**
     * @Route("/info/{verb}", name="info", options={ "expose" : true })
     */
    public function info(string $verb)
    {
        $client = new GuzzleClient();
		$res = $client->get('https://jisho.org/api/v1/search/words?keyword=' . urlencode($verb));
        return $this->json( json_decode( $res->getBody()->getContents(), true ) );
    }
}