PGDMP                      }            crypto_broker    17.5    17.5                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    16389    crypto_broker    DATABASE     �   CREATE DATABASE crypto_broker WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE crypto_broker;
                     postgres    false            	           0    0    DATABASE crypto_broker    ACL     4   GRANT ALL ON DATABASE crypto_broker TO broker_user;
                        postgres    false    4872            �            1259    16439    investments    TABLE     �  CREATE TABLE public.investments (
    id integer NOT NULL,
    user_id integer,
    plan character varying(20),
    amount numeric,
    roi numeric,
    duration integer,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying,
    next_roi_date date,
    roi_days_remaining integer,
    total_earned numeric DEFAULT 0,
    last_activity_date date
);
    DROP TABLE public.investments;
       public         heap r       postgres    false            
           0    0    TABLE investments    ACL     6   GRANT ALL ON TABLE public.investments TO broker_user;
          public               postgres    false    220            �            1259    16438    investments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.investments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.investments_id_seq;
       public               postgres    false    220                       0    0    investments_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.investments_id_seq OWNED BY public.investments.id;
          public               postgres    false    219                       0    0    SEQUENCE investments_id_seq    ACL     @   GRANT ALL ON SEQUENCE public.investments_id_seq TO broker_user;
          public               postgres    false    219            �            1259    16393    users    TABLE     <  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_admin boolean DEFAULT false,
    wallet_balance numeric DEFAULT 0
);
    DROP TABLE public.users;
       public         heap r       postgres    false                       0    0    TABLE users    ACL     0   GRANT ALL ON TABLE public.users TO broker_user;
          public               postgres    false    218            �            1259    16392    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218                       0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217                       0    0    SEQUENCE users_id_seq    ACL     :   GRANT ALL ON SEQUENCE public.users_id_seq TO broker_user;
          public               postgres    false    217            a           2604    16442    investments id    DEFAULT     p   ALTER TABLE ONLY public.investments ALTER COLUMN id SET DEFAULT nextval('public.investments_id_seq'::regclass);
 =   ALTER TABLE public.investments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            ]           2604    16396    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218                      0    16439    investments 
   TABLE DATA           �   COPY public.investments (id, user_id, plan, amount, roi, duration, start_date, status, next_roi_date, roi_days_remaining, total_earned, last_activity_date) FROM stdin;
    public               postgres    false    220   �                  0    16393    users 
   TABLE DATA           d   COPY public.users (id, username, email, password, created_at, is_admin, wallet_balance) FROM stdin;
    public               postgres    false    218   �                   0    0    investments_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.investments_id_seq', 40, true);
          public               postgres    false    219                       0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 66, true);
          public               postgres    false    217            l           2606    16447    investments investments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.investments
    ADD CONSTRAINT investments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.investments DROP CONSTRAINT investments_pkey;
       public                 postgres    false    220            f           2606    16405    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            h           2606    16401    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            j           2606    16403    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    218            m           2606    16448 $   investments investments_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.investments
    ADD CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 N   ALTER TABLE ONLY public.investments DROP CONSTRAINT investments_user_id_fkey;
       public               postgres    false    220    218    4712                       826    16406    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     `   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO broker_user;
          public               postgres    false               �  x���mNA�oN���3s���?-P�D���'�ݐz��VQ��<zm��_~|{�]��x@@zvMr�ѺJWe]~�?�=>?,7���q�8������u�C��.P�k��q�����$# ��'�w�NT�4�(�Qt�.^�W� �%H�l�ōR%vO
�ځKs��B|�����<rb�3F��B�#��Լe���w
��CKMG��A)���u�Q^��I��=��qG�܊ՠp��3�M1d��Bت�>����@Xܼi�\�L��U��(��U��rJ�YC���NXX�jj}��"
#�.�5/��)�iZT�.Z'�����4��bǡb�kŶܾ<�||�u�	�V')*#�h1�t����p�((�Ǡ��M%�Baߝ6:Q��u��P½�=p�p)��:��&F'bF[�6�Pd��,$#7�4W�P�,�WRp�43��d�W�֩j�`�ຩI��ǮwmQ(�6��-�:8S{5�bj�S�=0)%&�x`���?y�8�p�D�$�1�����=X|�ȶ�d[bMR�h�]eg/��m�I�r�Y�q���-�<�4�F��)�{���jbC�Na����~�����X��z�
�>�;��,����;�.�-�c]Y���:�̼_a�HE��jN[3_�]��+-`�X�1K�2n��b�M���8^j�WNS���c�h&ǂ�=m.�aޔ����u�          �
  x�}�K����ǜ_��4@w���(*��r��AQ������I�ѝ�X�����zK��ݼ��9�ֿ_"��$b��ǿ ��?��Xrr��ʀE�2�vpZ��W	 2�Y��Y��W��9d ��x�7@�x�'�=�X(R�%���0��YQ�������o��qJk�,�2�3Y׸:}+���ƺZ���B�ȱgB坊z�g�H�O*i�N�d_ڥJ��}��ˉyY�,p����^�[�������T֪�mSW��ߞ������p@z��������L?���;��$�}Wg<`7~�� �SZ�,�5vP%{v��Z[Ě�f�GLw7i~gB؅���Bɓ)1���s��=��א�i<�ڬ1�Ge����\ѳ�j@����,�k�Mt����U�����,/!�_a<3��`.����������hI�;L�����H�����0:K���e���܊�b�<�)��+� 0��/\���'T�\pL��#Y�����O��͕i���t�x�}�rKݳ��y�J=����D��/��lǾ~1�������G��Cĭ��@����Qj%t�t~���8���rZ�Z.���΢j�f/Axqc���L�\>����G�՝�O�|H�݌7y��.W���D��E�2��d:u߱b�,�P ���g���z%�Ot�K���q���~��d��a�/Gp����+w���
��ǣ�Xy̋��_H�1�'�D�T(=.X��q!+Y���fm�&�E�M�12t�2ftWn��v�Պ�o��U^d1��^����>����z�Ty-���X%��T5��/�Ia��)s�'��,t�*�b��*�@|A�*|Be�W�t3���J��f�f?74WK0�Yp�o���YJt0��H7ޡROY	S�=������|"��)�se �� �"�}�unȯvGq<݈�bW�c�(�C�ל@��!Q�6+D�Wu�|G��{������Lzr���J�x�M��b�}~ש�w\�*C�\�Iz<�!���W\a��w��fhk(Wl��*��:K�ۙD��޹e袝N����ℏ�pU�3|#��϶�>/(j�}Y�_��=ٌ�v��ɒ*����^ݹi��7����x1H��{=��/�o�Vi���eT_��-��- �$� H��8��M��M>��U�kf�K��,�J7Y&B|3�I%��}�[q�ZgaŤ�y���<�bF��~��𹖏�H?d�jF�O[1�����`�[��Gq����c�M7՘KJY������ �C�oA)#g�%aN���rSN�sx�����v�g�D{pp�3{��{x ���t'��8�
��A��>��D^�E�$��uS:m��v������a�qM_����nWiP�ւO.�F]:�ٿ���I�3}5m�LI?7�=�xmDzy^�O�@-��ԿF���%�ۙe�i~����6U�H��$�e��bYh�7,�{P`,���E�T���8��tsyW�m�v��Zl�BNZ���������d?��y�@"��������t��;�d�����ڛ�&���J��bl�&d!
���I
��o��+X��D��7������'��<�]��J�"�ӲI��`l��e��C���}u7�`�m�~$n>y�j�����%.e&~�9s�υgg��'1�~(��<��qR�!?s����fE^��t5��V���1k�۩��cΦNf�&X�/�M)��G�
�W><#�i����.<��_Y���R���DrӍ���k�ؕ�hn�ػ�)P��j��➍I��e�7>�z"K�$b��m�Z���O^y||��+$�`<��s��tK�F=s�����NS/`ET����`��S͔G��:F�9cn�'vh�p�R�z�p��yS=6�-V���A`'�z�v$����0�/3���{����@�/�cd�W��z�Q�n�_A�?�W�א"p�DH����7W٦0`�cf~�,=9��x��'�~�>ҳU�N���ץÔ�������3�.�?.82�ߡ^�;�l��n%#]-���=�c|W�;7p�oġ�ŷ����Y	��JL�Q��Ɍ���N)�3��g��ٰ��ʫiúh���&;������O��4�̾ ����T�ʖ%Hwހo?�P;����|R�}r���/wiu����X�4t�V5k:�*�ZRY4%܅�����ԥw;�tEP��~��m'������^Ι���FD�_�i�o��6_�4U5W�+�[� �8�nޘ]�2���}5�G�u�~�R����Hh�n��:޶��wi�O�i�ᾕ��_���rh�<���̎�|��������+un�ͩ?˴s��i����B�v���3�D�n����6�k����g�B��j|vt�aU�\��K'�ޫ�nl�m*m��v��a�n��� �����v�V8tG� �o��|r�â�ˣ޷+-��U�@3�"=�|,�����\�4ژ���y?���"�ŝv~#��s�0��w���'����� ��P���/�.��u�(�qS�j�
�>;2gS��gs�V�y����n�=����KH���h�@}���ċ�0�@�jE;Q�(�V�بZ6�j<�v����yPޭ�%����mTF��
������Uk���~rG�ȕ�X��`� 48���A�8��N�	�	'r2YU�y{0W����h�M8 �X����ቀ�����׿ �yl-     